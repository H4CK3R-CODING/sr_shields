import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDB from "./config/connectToDB.js";
import mainRouter from "./routes/index.js";

// ✅ Load environment variables
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/v1", mainRouter);

app.get("/", (req, res) => {
  console.log("Ping-backend: " + new Date().toLocaleString());
  res.json({ msg: "Hello" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Self-ping setup
const PING_INTERVAL = 15 * 60 * 1000; // 15 minutes
const SELF_PING_URL = process.env.SELF_URL || `http://localhost:${PORT}/`;

function startSelfPing() {
  setInterval(async () => {
    try {
      const res = await fetch(SELF_PING_URL); // Node 18+ has global fetch
      console.log(`[${new Date().toISOString()}] Self-ping: ${res.status}`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Self-ping failed: ${err.message}`);
    }
  }, PING_INTERVAL);
}

// ✅ Start server after DB connection
const startServer = async () => {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      startSelfPing(); // 🔥 Start ping loop
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  }
};

startServer();
