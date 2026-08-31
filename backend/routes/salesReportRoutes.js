import express from "express";

import {
  getSalesReport,
} from "../controllers/salesReportController.js";

const router = express.Router();

router.get("/", getSalesReport);

export default router;