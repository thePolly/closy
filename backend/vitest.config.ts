import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      UPLOADS_DIR: "/tmp/closy-test-uploads",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      GEMINI_API_KEY: "test-key",
    },
  },
});
