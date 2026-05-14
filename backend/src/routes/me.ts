import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { updateTimezone } from "../controllers/me.controller";

const router: Router = Router();

router.use(authenticateToken);

router.patch("/timezone", updateTimezone);

export default router;
