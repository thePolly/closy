import fs from "node:fs";
import request from "supertest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../db/pool", () => ({ pool: { query: vi.fn() } }));
vi.mock("../ai/analyzeClothing", () => ({ analyzeClothing: vi.fn() }));

import { analyzeClothing } from "../ai/analyzeClothing";
import { createApp } from "../app";
import { pool } from "../db/pool";
import { mimeTypeForFile, uniqueName } from "./wardrobe";

const app = createApp();
const UPLOADS_DIR = process.env.UPLOADS_DIR as string;

const sampleAnalysis = {
  name: "White T-Shirt",
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
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [] } as never) // uniqueName: no existing names
      .mockResolvedValueOnce({
        rows: [{ id: "1", name: "White T-Shirt", analysis_status: "completed" }],
      } as never); // INSERT

    const res = await request(app)
      .post("/wardrobe")
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.analysis_status).toBe("completed");
    expect(analyzeClothing).toHaveBeenCalledOnce();

    const insertCall = vi.mocked(pool.query).mock.calls[1];
    expect(insertCall[0]).toContain("'completed'");
    expect(insertCall[1]).toContain("White T-Shirt");
  });

  it("numbers a duplicate name on save", async () => {
    vi.mocked(analyzeClothing).mockResolvedValue(sampleAnalysis);
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [{ name: "White T-Shirt" }] } as never) // uniqueName: one exists
      .mockResolvedValueOnce({
        rows: [{ id: "2", name: "White T-Shirt 2", analysis_status: "completed" }],
      } as never); // INSERT

    const res = await request(app)
      .post("/wardrobe")
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    const insertParams = vi.mocked(pool.query).mock.calls[1][1] as unknown[];
    expect(insertParams).toContain("White T-Shirt 2");
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

    const insertCall = vi.mocked(pool.query).mock.calls[0];
    expect(insertCall[0]).toContain("'failed'");
    expect(insertCall[1]).not.toContain("White");
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

  it("generates a name when a retry succeeds", async () => {
    fs.writeFileSync(`${UPLOADS_DIR}/retry-test.jpg`, "fake-image-bytes");
    vi.mocked(analyzeClothing).mockResolvedValue(sampleAnalysis);
    vi.mocked(pool.query)
      .mockResolvedValueOnce({
        rows: [{ image_url: "http://localhost:3000/uploads/retry-test.jpg" }],
      } as never) // SELECT existing item
      .mockResolvedValueOnce({ rows: [] } as never) // uniqueName: no existing names
      .mockResolvedValueOnce({
        rows: [{ id: "1", name: "White T-Shirt", analysis_status: "completed" }],
      } as never); // UPDATE

    const res = await request(app).post("/wardrobe/1/retry-analysis");

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("White T-Shirt");
    const updateParams = vi.mocked(pool.query).mock.calls[2][1] as unknown[];
    expect(updateParams).toContain("White T-Shirt");
  });

  it("returns 502 and does not set a name when a retry fails again", async () => {
    fs.writeFileSync(`${UPLOADS_DIR}/retry-test.jpg`, "fake-image-bytes");
    vi.mocked(analyzeClothing).mockRejectedValue(new Error("gemini down"));
    vi.mocked(pool.query)
      .mockResolvedValueOnce({
        rows: [{ image_url: "http://localhost:3000/uploads/retry-test.jpg" }],
      } as never) // SELECT existing item
      .mockResolvedValueOnce({ rows: [] } as never); // UPDATE analysis_status = 'failed'

    const res = await request(app).post("/wardrobe/1/retry-analysis");

    expect(res.status).toBe(502);
    expect(pool.query).toHaveBeenCalledTimes(2); // no uniqueName / name UPDATE call
  });
});

describe("PATCH /wardrobe/:id", () => {
  it("renames an item", async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: "1", name: "My Favourite Jeans" }],
    } as never);

    const res = await request(app)
      .patch("/wardrobe/1")
      .send({ name: "  My Favourite Jeans  " });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("My Favourite Jeans");
    const updateParams = vi.mocked(pool.query).mock.calls[0][1] as unknown[];
    expect(updateParams).toContain("My Favourite Jeans"); // trimmed
  });

  it("rejects an empty name", async () => {
    const res = await request(app).patch("/wardrobe/1").send({ name: "   " });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name is required/i);
  });

  it("returns 404 for an unknown item", async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);
    const res = await request(app).patch("/wardrobe/nope").send({ name: "New name" });
    expect(res.status).toBe(404);
  });
});

describe("uniqueName", () => {
  it("returns the base name when it is free", async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);
    expect(await uniqueName("Jeans")).toBe("Jeans");
  });

  it("appends the next free number when the base name is taken", async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ name: "Jeans" }, { name: "Jeans 2" }],
    } as never);
    expect(await uniqueName("Jeans")).toBe("Jeans 3");
  });

  it("matches existing names case-insensitively", async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [{ name: "jeans" }] } as never);
    expect(await uniqueName("Jeans")).toBe("Jeans 2");
  });
});
