import express from "express";
import {
  addBookingPayment,
  createBooking,
  deleteBooking,
  getDashboard,
  searchCustomers,
  updateBooking,
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
router.put("/bookings/:id", updateBooking);
router.delete("/bookings/:id", deleteBooking);


export default router;
