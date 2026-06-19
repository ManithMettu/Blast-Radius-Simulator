import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../types";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: "Route not found", code: "NOT_FOUND" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    });
    return;
  }

  console.error("[ERROR]", err);

  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
