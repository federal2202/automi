import { Router } from "express";
import {
  getRecurringActivities,
  getRecurringActivityById,
  createRecurringActivity,
  updateRecurringActivity,
  deleteRecurringActivity,
} from "../controllers/recurring-activities.controller";

// mergeParams: true so :periodId from the parent router propagates here.
const router: Router = Router({ mergeParams: true });

router.get("/", getRecurringActivities);
router.get("/:id", getRecurringActivityById);
router.post("/", createRecurringActivity);
router.patch("/:id", updateRecurringActivity);
router.delete("/:id", deleteRecurringActivity);

export default router;
