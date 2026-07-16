import { defineConfig } from "vitest/config";

// Requires a local Postgres, separate from the Supabase instance in
// backend/.env — tests must never touch that database:
//   docker run -d --name automi-test-db -e POSTGRES_PASSWORD=test \
//     -e POSTGRES_DB=automi_test -p 5433:5432 postgres:16-alpine
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    coverage: { provider: "v8", reporter: ["text", "html"] },
    // Integration tests share one database — don't parallelize across files.
    fileParallelism: false,
    // Set BEFORE any module (including src/lib/prisma.ts) is imported, so the
    // Prisma client is constructed against the local Docker test DB — never
    // the live Supabase DATABASE_URL in backend/.env. dotenv's `config()`
    // (loaded by lib/prisma.ts) does not override already-set env vars, so
    // these win even though every source file still does `import "dotenv/config"`.
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://postgres:test@localhost:5433/automi_test",
      JWT_SECRET: "test-secret",
      JWT_REFRESH_SECRET: "test-refresh-secret",
      GEMINI_API_KEY: "test-key",
    },
  },
});
