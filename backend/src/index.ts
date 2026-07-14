import "dotenv/config";
import { createApp } from "./app";
import { ensureSchema } from "./db/schema";

const app = createApp();
const port = process.env.PORT ?? 3000;

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
