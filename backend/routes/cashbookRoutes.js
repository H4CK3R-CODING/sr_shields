import express from "express";

import {
  addTransaction,
  getCashbook,
} from "../controllers/cashbookController.js";

const router = express.Router();

router.post("/add", addTransaction);

router.get("/", getCashbook);

export default router;