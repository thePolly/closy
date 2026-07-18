import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../db/pool", () => ({ pool: { query: vi.fn() } }));
vi.mock("../ai/generateStylistReply", () => ({ generateStylistReply: vi.fn() }));
vi.mock("../ai/generateClothingImage", () => ({ generateClothingImage: vi.fn() }));
vi.mock("node:fs/promises", () => ({ writeFile: vi.fn() }));

import { writeFile } from "node:fs/promises";
import { generateClothingImage } from "../ai/generateClothingImage";
import { generateStylistReply } from "../ai/generateStylistReply";
import { createApp } from "../app";
import { pool } from "../db/pool";

const app = createApp();

const draftItem = {
  name: "White Oversized Linen Shirt",
  clothingType: "Shirt",
  fit: "Oversized",
  primaryColor: "White",
  secondaryColor: null,
  pattern: "Solid",
  season: "Summer",
  style: "Casual",
  material: "Linen",
  suitableOccasions: "Everyday",
};

afterEach(() => {
  vi.mocked(pool.query).mockReset();
  vi.mocked(generateStylistReply).mockReset();
  vi.mocked(generateClothingImage).mockReset();
  vi.mocked(writeFile).mockReset();
});

describe("POST /chat", () => {
  it("rejects a request with no message", async () => {
    const res = await request(app).post("/chat").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/message is required/i);
  });

  it("returns a plain reply for normal conversation", async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);
    vi.mocked(generateStylistReply).mockResolvedValue({
      type: "text",
      reply: "Try your white shirt with jeans!",
    });

    const res = await request(app).post("/chat").send({ message: "What should I wear?" });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe("Try your white shirt with jeans!");
    expect(generateClothingImage).not.toHaveBeenCalled();
  });

  it("generates an image and saves a new item when the model calls add_clothing_item", async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [] } as never) // wardrobe summary select
      .mockResolvedValueOnce({ rows: [] } as never) // uniqueName: no existing names
      .mockResolvedValueOnce({
        rows: [{ id: "1", name: "White Oversized Linen Shirt" }],
      } as never); // INSERT
    vi.mocked(generateStylistReply).mockResolvedValue({
      type: "add_clothing_item",
      item: draftItem,
    });
    vi.mocked(generateClothingImage).mockResolvedValue(Buffer.from("fake-png-bytes"));
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const res = await request(app)
      .post("/chat")
      .send({ message: "I bought a white oversized linen shirt." });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe("Added White Oversized Linen Shirt to your wardrobe!");
    expect(writeFile).toHaveBeenCalledOnce();

    const insertCall = vi.mocked(pool.query).mock.calls[2];
    expect(insertCall[1]).toContain("White Oversized Linen Shirt");
  });

  it("replies with an error and saves nothing when image generation fails", async () => {
    vi.mocked(pool.query).mockResolvedValue({ rows: [] } as never);
    vi.mocked(generateStylistReply).mockResolvedValue({
      type: "add_clothing_item",
      item: draftItem,
    });
    vi.mocked(generateClothingImage).mockRejectedValue(new Error("gemini image down"));

    const res = await request(app)
      .post("/chat")
      .send({ message: "I bought a white oversized linen shirt." });

    expect(res.status).toBe(200);
    expect(res.body.reply).toMatch(/couldn't add/i);
    expect(pool.query).toHaveBeenCalledTimes(1); // only the wardrobe summary select
    expect(writeFile).not.toHaveBeenCalled();
  });
});
