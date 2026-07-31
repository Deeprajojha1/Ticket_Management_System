import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return err;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return new ApiError(422, "Validation failed", errors, err.stack);
  }

  if (err?.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return new ApiError(409, "Resource already exists", fields, err.stack);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, "Invalid resource identifier", [], err.stack);
  }

  return new ApiError(err.statusCode || err.status || 500, err.message || "Internal server error", [], err.stack);
};

const errorMiddleware = (err, _req, res, _next) => {
  const apiError = normalizeError(err);
  const isProduction = process.env.NODE_ENV === "production";

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    errors: apiError.errors,
    ...(isProduction ? {} : { stack: apiError.stack }),
  });
};

export default errorMiddleware;
