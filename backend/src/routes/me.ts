import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { updateTimezone, completeOnboarding } from "../controllers/me.controller";

const router: Router = Router();

router.use(authenticateToken);

router.patch("/timezone", updateTimezone);
router.post("/onboarding/complete", completeOnboarding);

export default router;
