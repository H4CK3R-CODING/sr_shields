import express from "express";
import {
  signup,
  verifyOtp,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
