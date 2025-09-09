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
    const subject = "Verify Your Email Address - ✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆";
    const message = `<div style="font-family: Arial, sans-serif; margin: 0; padding: 0;"><div style="max-width: 600px; margin: 30px auto; padding: 30px; border-radius: 6px; border: 1px solid #ddd;"><h2 style="color: #2c3e50; margin-top: 0;">Email Verification - ✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆</h2><p style="font-size: 16px; color: #333333; line-height: 1.6;">Dear ${name},</p><p style="font-size: 16px; color: #333333; line-height: 1.6;">Thank you for registering with <strong>✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆</strong>. To complete your registration, please verify your email address by entering the One-Time Password (OTP) provided below.</p><!-- ATTRACTIVE OTP BOX --><div style="background-color: #f0f6ff; border: 1px solid #b3d7ff; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;"><p style="font-size: 18px; color: #2c3e50; margin: 0 0 10px 0;">Your OTP is</p><div style="font-size: 36px; font-weight: bold; color: #0056b3; letter-spacing: 6px; padding: 12px 20px; background-color: #e6f0ff; border-radius: 6px; display: inline-block;">${otp}</div></div><p style="font-size: 16px; color: #333333; line-height: 1.6;">Please enter this OTP on the verification page to confirm your email address. This step is essential to activate your account and access all the features of <strong>✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆</strong>.</p><p style="font-size: 16px; color: #333333; line-height: 1.6;">If you did not request this registration or have any issues, please contact our support team immediately.</p><p style="font-size: 14px; color: #777777; text-align: center; margin-top: 40px;">Best regards,<br>Sourav<br>✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆ Support Team</p></div></div>`;
    await sendMail(subject, message, email );

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

    const subject = "Password Reset Request"; 
    const message =  `<div style="font-family: Arial, sans-serif; margin: 0; padding: 0;"><div style="max-width: 600px; margin: 30px auto; padding: 30px; border-radius: 6px; border: 1px solid #ddd;"><h2 style="color: #2c3e50; margin-top: 0;">Password Reset Request</h2><p style="font-size: 16px; color: #333333; line-height: 1.6;">Dear ${user.name},</p><p style="font-size: 16px; color: #333333; line-height: 1.6;">We received a request to reset the password for your account. If you did not request a password reset, you can safely ignore this email.</p><p style="font-size: 16px; color: #333333; line-height: 1.6;">If you did request a reset, please use the <strong>One-Time Password (OTP)</strong> below to proceed:</p><!-- ATTRACTIVE OTP BOX --><div style="background-color: #f0f6ff; border: 1px solid #b3d7ff; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;"><p style="font-size: 18px; color: #2c3e50; margin: 0 0 10px 0;">Your OTP is</p><div style="font-size: 36px; font-weight: bold; color: #0056b3; letter-spacing: 6px; padding: 12px 20px; background-color: #e6f0ff; border-radius: 6px; display: inline-block;">${otp}</div><p style="font-size: 14px; color: #666666; margin-top: 12px;">(This OTP is valid for the next 5 minutes)</p></div><p style="font-size: 16px; color: #333333; line-height: 1.6;">For security reasons, please do not share this OTP with anyone. Once expired, you'll need to request a new one.</p><p style="font-size: 16px; color: #333333; line-height: 1.6;">If you need help or face any issues, feel free to reach out to our support team.</p><p style="font-size: 16px; color: #333333; line-height: 1.6;">Website: <a href="https://sr-shields.vercel.app/" style="color: #007BFF; text-decoration: none;">Click here</a></p><p style="font-size: 14px; color: #777777; text-align: center; margin-top: 40px;">Best regards,<br>✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆ Support Team</p></div></div>`;

    await sendMail(subject, message, email)

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
