import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const isProd = process.env.NODE_ENV === "production";
const level = isProd ? "info" : "debug";

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message }) =>
      `${timestamp} ${level.toUpperCase()} ${message}`
  )
);

const transports = [];

if (!isProd) {
  transports.push(new winston.transports.Console({ format }));
}

// Optional: enable file logging for production
// transports.push(new winston.transports.File({ filename: "logs/error.log", level: "error" }));
// transports.push(new winston.transports.File({ filename: "logs/combined.log" }));

const logger = winston.createLogger({ level, levels, transports });

export default logger;
