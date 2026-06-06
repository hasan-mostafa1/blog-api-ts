import type { Request, Response, NextFunction } from "express";

interface CustomHttpError extends Error {
  statusCode?: number | string;
}

const errorMiddleware = (
  err: CustomHttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  const status = err.statusCode ? +err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  res.status(isNaN(status) ? 500 : status).json({ error: message });
};

export default errorMiddleware;
