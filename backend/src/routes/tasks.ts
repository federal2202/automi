import { Router, Request, Response } from "express";
import { GenerateResponse } from "../types/ai";
import { generateText } from "../services/gemini.service";

const router: Router = Router();

router.post('/generate', async (
    req: Request<{}, {}, {prompt: string}>,
    res: Response<GenerateResponse>
) => {
    const { prompt } = req.body;

    try {
        const generatedText = await generateText(prompt);
        res.json({ success: true, data: generatedText });
    } catch (error) {
        console.error("Error generating text:", error);
        res.status(500).json({ success: false, error: "Failed to generate text" });
    }
})

export default router;