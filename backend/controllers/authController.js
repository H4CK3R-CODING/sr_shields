import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendMail from "../utils/sendMail.js";
import genOtp from "../utils/genOtp.js";
import { userAuth } from "../zod/userAuth.js";

// Signup
export const signup = async (req, res) => {
  try {
    // Validate input using Zod
    const parsedData = userAuth.safeParse(req.body);
    if (!parsedData.success)
      return res.status(400).json({ errors: parsedData.error.errors });

    const {
      name,
      email,
      password,
      course,
      college,
      session,
      phone_number,
      role,
    } = parsedData.data;

    const existingUser = await User.findOne({ email, isVerified: true });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = genOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // const newUser = await User.create({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   course,
    //   college,
    //   session,
    //   phone_number,
    //   role,
    //   otp,
    //   otpExpires,
    // });

    // Send OTP email
    await sendMail(
      "Verify Your Email OTP",
      `<h3>Your OTP is: ${otp}</h3><p>It expires in 10 minutes.</p>`,
      email
    );

    const newUser = await User.updateOne(
      { email },
      {
        $set: {
          name,
          password: hashedPassword,
          course,
          college,
          session,
          phone_number,
          role,
          otp,
          otpExpires,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "User registered. OTP sent to your email.",
      userId: newUser._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password: send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = genOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendMail(
      "Password Reset OTP",
      `<h3>Your OTP for password reset is: ${otp}</h3><p>It expires in 10 minutes.</p>`,
      email
    );

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password: verify OTP + set new password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(401).json({
        message: "Please provide all the fields",
      });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified)
      return res.status(400).json({ message: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    // Optionally set JWT in cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 15 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const isLogin = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ msg: "No token, authorization denied" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -otp -otpExpires");
    console.log(user)

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(401).json({ msg: "Invalid token", error: err.message });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
};
