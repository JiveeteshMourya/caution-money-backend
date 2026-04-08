import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import logger from "./src/utils/logger.js";

dotenv.config();

import { validateEnv } from "./src/config/env.js";
validateEnv();

import connectDB from "./src/config/db.js";

// Routes
import authRoutes from "./src/routes/auth.js";
import studentRoutes from "./src/routes/student.js";
import adminRoutes from "./src/routes/admin.js";
import applicationRoutes from "./src/routes/application.js";
import imageRoutes from "./src/routes/imageRoutes.js";

import { errorHandler } from "./src/middleware/errorHandler.js";

connectDB();

const app = express();

// Security middleware
app.use(helmet());
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts, please try again later." },
});

app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

app.use(express.json({ limit: "10kb" }));

const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms", {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/image", imageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "IEHE Portal API running",
    timestamp: new Date(),
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 IEHE Caution Money Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});
