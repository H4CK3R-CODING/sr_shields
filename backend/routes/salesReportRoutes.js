import express from "express";

import {
  getSalesReport,
} from "../controllers/salesReportController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

router.use(authenticate);
router.use(adminOnly);

router.get("/", getSalesReport);

export default router;