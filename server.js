import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./src/common/db/connection.js";
import cors from "cors";
import morgan from "morgan";
import logger from "./src/common/utils/logger.js";
import { errorHandler } from "./src/middlewares/errorMiddlewares.js";

dotenv.config({ path: "./.env" });
const app = express();
const port = process.env.PORT || 9000;
const isProd = process.env.NODE_ENV === "production";

// HTTP logs (dev only)
if (!isProd) {
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms", {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );
}

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.status(200).send("Server is up and running");
});

app.use(errorHandler);

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error => ", error);
      throw error;
    });
    app.listen(port, () => {
      console.log(`Server is running on port => ${port}`);
    });
  })
  .catch((error) => {
    console.log("DB connection failed => ", error);
  });
