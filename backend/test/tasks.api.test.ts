import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { generateAccessToken } from "../src/utils/jwt";

async function makeUser(email: string) {
  return prisma.user.create({
    data: {
      googleId: email,
      email,
      name: "Test User",
      accessToken: "x",
      refreshToken: "y",
      expiresAt: new Date(Date.now() + 3600_000),
      scope: "s",
    },
  });
}

async function makeTask(userId: string, title: string) {
  return prisma.task.create({
    data: {
      eventId: `evt-${title}`,
      userId,
      title,
      description: "",
      estimatedTimeMinutes: 30,
      difficulty: "medium",
      steps: [],
      resources: [],
      successCriteria: "",
      aiStatus: "pending",
    },
  });
}

const cookie = (id: string) => [`accessToken=${generateAccessToken(id)}`];

describe("GET /tasks — user isolation", () => {
  it("never returns another user's tasks", async () => {
    const alice = await makeUser("alice@example.com");
    const bob = await makeUser("bob@example.com");
    await makeTask(bob.id, "Bob's secret task");

    const res = await request(app).get("/tasks").set("Cookie", cookie(alice.id));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns only the requesting user's own tasks", async () => {
    const alice = await makeUser("alice2@example.com");
    const bob = await makeUser("bob2@example.com");
    await makeTask(alice.id, "Alice task 1");
    await makeTask(alice.id, "Alice task 2");
    await makeTask(bob.id, "Bob task");

    const res = await request(app).get("/tasks").set("Cookie", cookie(alice.id));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((t: { userId: string }) => t.userId === alice.id)).toBe(true);
  });

  it("without a cookie returns 401", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(401);
  });

  it("with an expired token returns 403", async () => {
    const jwt = (await import("jsonwebtoken")).default;
    const expired = jwt.sign({ userId: "whoever" }, process.env.JWT_SECRET!, { expiresIn: -10 });
    const res = await request(app).get("/tasks").set("Cookie", [`accessToken=${expired}`]);
    expect(res.status).toBe(403);
  });
});

describe("GET /tasks/:id — user isolation", () => {
  it("someone else's task returns 404, not 403 (does not leak existence)", async () => {
    const alice = await makeUser("alice3@example.com");
    const bob = await makeUser("bob3@example.com");
    const bobTask = await makeTask(bob.id, "Bob private");

    const res = await request(app)
      .get(`/tasks/${bobTask.id}`)
      .set("Cookie", cookie(alice.id));
    expect(res.status).toBe(404);
  });

  it("owner can fetch their own task", async () => {
    const alice = await makeUser("alice4@example.com");
    const task = await makeTask(alice.id, "Alice task");

    const res = await request(app).get(`/tasks/${task.id}`).set("Cookie", cookie(alice.id));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(task.id);
  });
});

describe("PATCH /tasks/:id/done — toggle semantics", () => {
  it("without a body, toggling twice returns to the original state", async () => {
    const alice = await makeUser("alice5@example.com");
    const task = await makeTask(alice.id, "Toggle me");
    expect(task.isDone).toBe(false);

    const r1 = await request(app).patch(`/tasks/${task.id}/done`).set("Cookie", cookie(alice.id));
    expect(r1.body.isDone).toBe(true);

    const r2 = await request(app).patch(`/tasks/${task.id}/done`).set("Cookie", cookie(alice.id));
    expect(r2.body.isDone).toBe(false);
  });

  it("an explicit body sets the value regardless of current state", async () => {
    const alice = await makeUser("alice6@example.com");
    const task = await makeTask(alice.id, "Set me explicitly");

    const res = await request(app)
      .patch(`/tasks/${task.id}/done`)
      .set("Cookie", cookie(alice.id))
      .send({ isDone: true });
    expect(res.body.isDone).toBe(true);

    // Sending the same explicit value again must not flip it (proves it's
    // not silently falling back to the toggle branch).
    const res2 = await request(app)
      .patch(`/tasks/${task.id}/done`)
      .set("Cookie", cookie(alice.id))
      .send({ isDone: true });
    expect(res2.body.isDone).toBe(true);
  });

  it("cannot toggle another user's task", async () => {
    const alice = await makeUser("alice7@example.com");
    const bob = await makeUser("bob7@example.com");
    const bobTask = await makeTask(bob.id, "Bob task");

    const res = await request(app)
      .patch(`/tasks/${bobTask.id}/done`)
      .set("Cookie", cookie(alice.id));
    expect(res.status).toBe(404);
  });
});
