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

const cookie = (id: string) => [`accessToken=${generateAccessToken(id)}`];

describe("POST /periods — validation", () => {
  it("rejects an unknown field", async () => {
    const alice = await makeUser("period-alice@example.com");
    const res = await request(app)
      .post("/periods")
      .set("Cookie", cookie(alice.id))
      .send({ title: "Q3", startDate: "2026-07-01T00:00:00Z", endDate: "2026-09-30T00:00:00Z", extra: "nope" });
    expect(res.status).toBe(400);
  });

  it("rejects endDate before startDate", async () => {
    const alice = await makeUser("period-alice2@example.com");
    const res = await request(app)
      .post("/periods")
      .set("Cookie", cookie(alice.id))
      .send({ title: "Q3", startDate: "2026-09-30T00:00:00Z", endDate: "2026-07-01T00:00:00Z" });
    expect(res.status).toBe(400);
  });

  it("creates a valid period", async () => {
    const alice = await makeUser("period-alice3@example.com");
    const res = await request(app)
      .post("/periods")
      .set("Cookie", cookie(alice.id))
      .send({ title: "Q3", startDate: "2026-07-01T00:00:00Z", endDate: "2026-09-30T00:00:00Z" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Q3");
  });
});

describe("GET /periods/:id — user isolation", () => {
  it("someone else's period returns 404", async () => {
    const alice = await makeUser("period-alice4@example.com");
    const bob = await makeUser("period-bob@example.com");
    const bobPeriod = await prisma.period.create({
      data: {
        userId: bob.id,
        title: "Bob's period",
        startDate: new Date("2026-01-01T00:00:00Z"),
        endDate: new Date("2026-03-01T00:00:00Z"),
      },
    });

    const res = await request(app).get(`/periods/${bobPeriod.id}`).set("Cookie", cookie(alice.id));
    expect(res.status).toBe(404);
  });
});

describe("nested recurring-activities route — ownership", () => {
  it("404s when the parent period is not owned by the caller", async () => {
    const alice = await makeUser("period-alice5@example.com");
    const bob = await makeUser("period-bob2@example.com");
    const bobPeriod = await prisma.period.create({
      data: {
        userId: bob.id,
        title: "Bob's period",
        startDate: new Date("2026-01-01T00:00:00Z"),
        endDate: new Date("2026-03-01T00:00:00Z"),
      },
    });

    const res = await request(app)
      .get(`/periods/${bobPeriod.id}/activities`)
      .set("Cookie", cookie(alice.id));
    expect(res.status).toBe(404);
  });
});
