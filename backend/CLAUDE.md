# Backend Rules

## Architecture

### 1. Controllers hold the main logic
Route handlers must live in controller files (e.g. `src/controllers/tasks.controller.ts`), not inline in route files.

- `src/routes/*.ts` — only wires HTTP paths to controller functions. No business logic, no `prisma` calls, no try/catch logic in route files.
- `src/controllers/*.controller.ts` — exports the handler functions (request parsing, response shaping, error handling).
- `src/services/*.service.ts` — business logic, external API calls, DB access when reused across controllers.

**Pattern:**
```ts
// src/controllers/tasks.controller.ts
import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { prisma } from "../lib/prisma";

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({ where: { userId: req.user!.id } });
    res.json(tasks);
  } catch (error) {
    console.error("Failed to retrieve tasks:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
};

// src/routes/tasks.ts
import { Router } from "express";
import { getTasks } from "../controllers/tasks.controller";

const router: Router = Router();
router.get("/", getTasks);
export default router;
```

Naming: controller files end in `.controller.ts`, service files end in `.service.ts`.
