import { vi, describe, it, expect, beforeEach } from "vitest";

const sendMock = vi.fn().mockResolvedValue(undefined);
const connectMock = vi.fn().mockResolvedValue(undefined);

vi.mock("kafkajs", () => ({
  Kafka: class {
    producer() {
      return { connect: connectMock, send: sendMock };
    }
    consumer() {
      return {} as any;
    }
  },
}));

// Locks in BUG-2's fix: producer and consumer must agree on the same
// message shape end to end (ai-service/main.py publishes taskId+eventId+userId,
// backend's consumer forwards taskId to the client over SSE).
describe("publishTaskCreated — Kafka message contract", () => {
  beforeEach(() => {
    sendMock.mockClear();
    connectMock.mockClear();
    // kafka.service.ts caches its producer in module-level state — reset the
    // module registry so each test gets a fresh, unconnected producer.
    vi.resetModules();
  });

  it("sends taskId, eventId, userId, and title", async () => {
    const { publishTaskCreated } = await import("../src/services/kafka.service");
    await publishTaskCreated({ taskId: "t1", eventId: "e1", userId: "u1", title: "Prep review" });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.topic).toBe("task.created");
    const payload = JSON.parse(call.messages[0].value);
    expect(payload).toEqual({ taskId: "t1", eventId: "e1", userId: "u1", title: "Prep review" });
    // Keying by taskId keeps all messages for one task on the same partition.
    expect(call.messages[0].key).toBe("t1");
  });

  it("reuses a single connected producer across calls", async () => {
    const { publishTaskCreated } = await import("../src/services/kafka.service");
    await publishTaskCreated({ taskId: "t2", eventId: "e2", userId: "u2", title: "A" });
    await publishTaskCreated({ taskId: "t3", eventId: "e3", userId: "u3", title: "B" });

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });
});
