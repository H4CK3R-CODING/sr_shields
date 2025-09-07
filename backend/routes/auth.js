import express from "express";
import {
  signup,
  verifyOtp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  isLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/signin", login);
router.post("/logout", logout);
router.get("/me", isLogin);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
