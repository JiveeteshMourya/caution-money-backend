import ServerError from "../errors/ServerError.js";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ServerError) {
    return res.status(err.statusCode).json({
      success: err.success,
      statusCode: err.statusCode,
      message: err.message,
      ...(err.errors?.length && { errors: err.errors }),
    });
  }

  console.error(err.stack);
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
