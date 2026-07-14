import path from "node:path";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { chatRouter } from "./routes/chat";
import { healthRouter } from "./routes/health";
import { wardrobeRouter } from "./routes/wardrobe";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use("/health", healthRouter);
  app.use("/wardrobe", wardrobeRouter);
  app.use("/chat", chatRouter);

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(400).json({ message: error.message });
  });

  return app;
}
