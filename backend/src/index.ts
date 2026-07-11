import path from "node:path";
import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ensureSchema } from "./db/schema";
import { healthRouter } from "./routes/health";
import { wardrobeRouter } from "./routes/wardrobe";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/health", healthRouter);
app.use("/wardrobe", wardrobeRouter);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(400).json({ message: error.message });
});

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database schema", error);
    process.exit(1);
  });
