import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeneratedTaskData } from "../types/task";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const gemini = new GoogleGenerativeAI(apiKey);

const model = gemini.getGenerativeModel({
  model: "gemini-3-flash-preview",
});

export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text");
  }
}

function buildTaskPrompt(title: string): string {
  return `You are a productivity assistant. Given a calendar event title, generate a structured task breakdown in JSON.

Event title: "${title}"

Return ONLY valid JSON matching this exact shape (no markdown, no code fences):
{
  "title": "string — concise task title",
  "description": "string — what this task involves and why it matters",
  "estimatedTimeMinutes": number,
  "difficulty": "easy" | "medium" | "hard",
  "steps": [
    {
      "stepNumber": number,
      "title": "string",
      "instruction": "string — detailed actionable instruction"
    }
  ],
  "resources": [
    {
      "title": "string",
      "type": "article" | "video" | "tool" | "document",
      "url": "string"
    }
  ],
  "successCriteria": "string — how you know the task is complete"
}

Rules:
- steps must have 4 to 8 items
- resources is optional; omit the key or set to [] if not applicable
- difficulty must be exactly "easy", "medium", or "hard"
- estimatedTimeMinutes must be a positive integer
- Output ONLY the JSON object, nothing else`;
}

function validateGeneratedTask(raw: unknown): GeneratedTaskData {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Parsed result is not an object");
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.title !== "string" || obj.title.trim() === "") {
    throw new Error("Invalid field: title");
  }
  if (typeof obj.description !== "string" || obj.description.trim() === "") {
    throw new Error("Invalid field: description");
  }
  if (typeof obj.estimatedTimeMinutes !== "number") {
    throw new Error("Invalid field: estimatedTimeMinutes");
  }
  if (!["easy", "medium", "hard"].includes(obj.difficulty as string)) {
    throw new Error("Invalid field: difficulty");
  }
  if (!Array.isArray(obj.steps)) {
    throw new Error("Invalid field: steps");
  }
  if (typeof obj.successCriteria !== "string" || obj.successCriteria.trim() === "") {
    throw new Error("Invalid field: successCriteria");
  }

  return {
    title: obj.title,
    description: obj.description,
    estimatedTimeMinutes: obj.estimatedTimeMinutes,
    difficulty: obj.difficulty as "easy" | "medium" | "hard",
    steps: obj.steps,
    resources: Array.isArray(obj.resources) ? obj.resources : undefined,
    successCriteria: obj.successCriteria,
  };
}

async function callGeminiForTask(prompt: string): Promise<GeneratedTaskData> {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });

  const text = result.response.text().trim();
  const parsed: unknown = JSON.parse(text);
  return validateGeneratedTask(parsed);
}

export class TaskGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskGenerationError";
  }
}

export async function generateTaskFromTitle(title: string): Promise<GeneratedTaskData> {
  const prompt = buildTaskPrompt(title);

  try {
    return await callGeminiForTask(prompt);
  } catch (firstError) {
    // Retry once on parse or validation failure
    try {
      return await callGeminiForTask(prompt);
    } catch (secondError) {
      throw new TaskGenerationError(
        `Failed to generate task for "${title}" after retry: ${secondError}`
      );
    }
  }
}
