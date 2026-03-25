export const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.applicationId && { applicationId: err.applicationId }),
    });
  }

  console.error(err.stack);
  return res.status(500).json({
    error: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
