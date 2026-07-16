import { Kafka, Producer, Consumer } from "kafkajs";
import { notifyUser } from "./sse.service";

const kafka = new Kafka({
  clientId: "automi-backend",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

let producer: Producer | null = null;
let consumer: Consumer | null = null;

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    const p = kafka.producer();
    try {
      await p.connect();
    } catch (error) {
      // Don't cache a producer whose connect() never succeeded — otherwise
      // every future publishTaskCreated() call reuses the same broken
      // instance and fails forever until the process restarts.
      producer = null;
      throw error;
    }
    producer = p;
  }
  return producer;
}

export async function startTaskEnrichedConsumer(): Promise<void> {
  consumer = kafka.consumer({ groupId: "backend-sse" });
  await consumer.connect();
  await consumer.subscribe({ topic: "task.enriched", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      // A malformed message (bad JSON, missing userId) must not throw here:
      // kafkajs treats an eachMessage exception as fatal and crashes/retries
      // the whole consumer, silently killing real-time SSE for every user.
      try {
        const payload = JSON.parse(message.value?.toString() ?? "");
        if (!payload?.userId || !payload?.taskId) {
          console.error("task.enriched: message missing userId/taskId", payload);
          return;
        }
        // Forward taskId (the AI worker publishes taskId, not eventId). Previously
        // this read payload.eventId which was always undefined — see BUG-2.
        notifyUser(payload.userId, { type: "task.enriched", taskId: payload.taskId });
      } catch (error) {
        console.error("Failed to process task.enriched message:", error);
      }
    },
  });
}

export async function publishTaskCreated(payload: {
  taskId: string;
  eventId: string;
  userId: string;
  title: string;
}): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: "task.created",
    messages: [
      {
        key: payload.taskId,
        value: JSON.stringify(payload),
      },
    ],
  });
}
