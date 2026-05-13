import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getPeriods,
  getPeriodById,
  createPeriod,
  updatePeriod,
  deletePeriod,
} from "../controllers/periods.controller";
import recurringActivitiesRouter from "./recurring-activities";

const router: Router = Router();

router.use(authenticateToken);

router.get("/", getPeriods);
router.get("/:id", getPeriodById);
router.post("/", createPeriod);
router.patch("/:id", updatePeriod);
router.delete("/:id", deletePeriod);

// Nested resource: recurring activities live under a period.
// authenticateToken on this router covers the child router too.
router.use("/:periodId/activities", recurringActivitiesRouter);

export default router;
