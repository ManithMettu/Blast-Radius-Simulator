import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { Server as SocketServer } from "socket.io";
import { env } from "./config/env";
import { createControllers } from "./controllers";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { rateLimit } from "./middleware/rate-limit";
import { requestId } from "./middleware/request-id";
import { createRoutes } from "./routes";

function getAllowedOrigins(): string | string[] {
  return env.FRONTEND_URL.split(",").map((url) => url.trim());
}

export function buildExpressApp(io?: SocketServer) {
  const app = express();
  const controllers = createControllers(io);
  const allowedOrigins = getAllowedOrigins();

  app.set("trust proxy", 1);
  app.use(requestId);
  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", rateLimit);

  app.get("/", (_req, res) => {
    res.json({
      name: "Blast Radius Simulator API",
      version: "1.0.0",
      status: "running",
      docs: "/api/health",
    });
  });

  app.use("/api", createRoutes(controllers));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
