import express from "express";
import {
  addBookingPayment,
  createBooking,
  getDashboard,
  searchCustomers,
} from "../controllers/travelController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

router.use(authenticate);
router.use(adminOnly);

router.get("/dashboard", getDashboard);
router.get("/customers", searchCustomers);
router.post("/bookings", createBooking);
router.post("/bookings/:id/payments", addBookingPayment);

export default router;
