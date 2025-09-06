import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // No options needed
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectToDB;
