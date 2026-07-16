import { execSync } from "node:child_process";
import { beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../src/lib/prisma";

// DATABASE_URL is pinned to the local Docker test DB by vitest.config.ts's
// `test.env` — never the live Supabase URL in backend/.env.
beforeAll(() => {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
});

beforeEach(async () => {
  // Clean between tests, respecting FK order (children before parents).
  await prisma.syncedEvent.deleteMany();
  await prisma.recurringActivity.deleteMany();
  await prisma.period.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
