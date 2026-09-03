import express from "express";

import {
  addTransaction,
  deleteTransaction,
  getCashbook,
} from "../controllers/cashbookController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

router.use(authenticate);
router.use(adminOnly);

router.post("/add", addTransaction);

router.delete(
  "/:id",
  deleteTransaction
);

router.get("/", getCashbook);

export default router;