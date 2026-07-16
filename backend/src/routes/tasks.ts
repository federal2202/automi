import { Router, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticateToken } from "../middleware/auth";
import { GenerateResponse } from "../types/ai";
import { generateText } from "../services/gemini.service";
import {
  getTasks,
  getTaskById,
  toggleTaskDone,
} from "../controllers/tasks.controller";

const router: Router = Router();

router.use(authenticateToken);

// Each /generate call hits Gemini (costs money). Cap it hard per client so a
// runaway loop or abuse can't rack up spend (BUG-8).
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.patch("/:id/done", toggleTaskDone);

const MAX_PROMPT_LENGTH = 4000;

router.post("/generate", generateLimiter, async (
  req: Request<{}, {}, { prompt: string }>,
  res: Response<GenerateResponse>
) => {
  const { prompt } = req.body ?? {};

  // Every call here hits Gemini (money). Reject bad input before spending a
  // request on it instead of relying on the generic try/catch 500 below.
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    res.status(400).json({ success: false, error: "prompt is required and must be a non-empty string" });
    return;
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    res.status(400).json({ success: false, error: `prompt must be at most ${MAX_PROMPT_LENGTH} characters` });
    return;
  }

  try {
    const generatedText = await generateText(prompt);
    res.json({ success: true, data: generatedText });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({ success: false, error: "Failed to generate text" });
  }
});

export default router;
