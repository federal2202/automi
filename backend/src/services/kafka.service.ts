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
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
}

export async function startTaskEnrichedConsumer(): Promise<void> {
  consumer = kafka.consumer({ groupId: "backend-sse" });
  await consumer.connect();
  await consumer.subscribe({ topic: "task.enriched", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value!.toString());
      notifyUser(payload.userId, { type: "task.enriched", eventId: payload.eventId });
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
