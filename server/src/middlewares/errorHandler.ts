import { UserError } from "@/types/errors";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  console.log("Error handler middleware triggered");
  // Log the error details
  console.error(err.stack);
  // If it's a UserError, return the error message to the client
  if (err instanceof UserError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // For all other errors, return a generic error message
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
  return;
};
