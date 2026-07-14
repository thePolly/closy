import fs from "node:fs";
import request from "supertest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../db/pool", () => ({ pool: { query: vi.fn() } }));
vi.mock("../ai/analyzeClothing", () => ({ analyzeClothing: vi.fn() }));

import { analyzeClothing } from "../ai/analyzeClothing";
import { createApp } from "../app";
import { pool } from "../db/pool";
import { mimeTypeForFile } from "./wardrobe";

const app = createApp();
const UPLOADS_DIR = process.env.UPLOADS_DIR as string;

const sampleAnalysis = {
  clothingType: "T-Shirt",
  fit: "Regular Fit",
  primaryColor: "White",
  secondaryColor: null,
  pattern: "Solid",
  season: "Summer",
  style: "Casual",
  material: "Cotton",
  suitableOccasions: "Everyday",
  confidenceScore: 0.9,
};

beforeAll(() => {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
});

afterEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(analyzeClothing).mockReset();
  for (const file of fs.readdirSync(UPLOADS_DIR)) {
    fs.rmSync(`${UPLOADS_DIR}/${file}`);
  }
});

describe("mimeTypeForFile", () => {
  it("maps known image extensions", () => {
    expect(mimeTypeForFile("photo.png")).toBe("image/png");
    expect(mimeTypeForFile("photo.JPG")).toBe("image/jpeg");
    expect(mimeTypeForFile("photo.webp")).toBe("image/webp");
  });

  it("falls back to jpeg for unknown extensions", () => {
    expect(mimeTypeForFile("photo.xyz")).toBe("image/jpeg");
  });
});

describe("POST /wardrobe", () => {
  it("rejects a request with no image", async () => {
    const res = await request(app).post("/wardrobe");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/image file is required/i);
  });

  it("rejects a non-image file", async () => {
    const res = await request(app)
      .post("/wardrobe")
      .attach("image", Buffer.from("hello"), {
        filename: "note.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/only image/i);
  });

  it("saves metadata and marks completed when analysis succeeds", async () => {
    vi.mocked(analyzeClothing).mockResolvedValue(sampleAnalysis);
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: "1", analysis_status: "completed" }],
    } as never);

    const res = await request(app)
      .post("/wardrobe")
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.analysis_status).toBe("completed");
    expect(analyzeClothing).toHaveBeenCalledOnce();

    const insertParams = vi.mocked(pool.query).mock.calls[0][1] as unknown[];
    expect(insertParams).toContain("completed");
    expect(insertParams).toContain("White");
  });

  it("still saves the item as failed when analysis throws (no lost upload)", async () => {
    vi.mocked(analyzeClothing).mockRejectedValue(new Error("gemini down"));
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: "1", analysis_status: "failed" }],
    } as never);

    const res = await request(app)
      .post("/wardrobe")
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.analysis_status).toBe("failed");

    const insertParams = vi.mocked(pool.query).mock.calls[0][1] as unknown[];
    expect(insertParams).toContain("failed");
    expect(insertParams).not.toContain("White");
  });
});

describe("GET /wardrobe", () => {
  it("returns the list of items", async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: "1" }, { id: "2" }],
    } as never);

    const res = await request(app).get("/wardrobe");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /wardrobe/:id/retry-analysis", () => {
  it("returns 404 for an unknown item", async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);

    const res = await request(app).post("/wardrobe/does-not-exist/retry-analysis");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
