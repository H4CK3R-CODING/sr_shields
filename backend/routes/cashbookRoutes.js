import express from "express";

import {
  addTransaction,
  deleteTransaction,
  getCashbook,
} from "../controllers/cashbookController.js";

const router = express.Router();

router.post("/add", addTransaction);

router.delete(
  "/:id",
  deleteTransaction
);

router.get("/", getCashbook);

export default router;