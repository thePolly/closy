import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../db/pool", () => ({ pool: { query: vi.fn() } }));

import { createApp } from "../app";
import { pool } from "../db/pool";

// Exercised through a route that already uses requireUser, since the
// middleware itself has no dedicated endpoint.
const app = createApp();

afterEach(() => {
  vi.mocked(pool.query).mockReset();
});

describe("requireUser", () => {
  it("rejects a request with no X-User-Id header", async () => {
    const res = await request(app).get("/wardrobe");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/X-User-Id/i);
  });

  it("rejects an X-User-Id that doesn't match a known user", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as never);

    const res = await request(app).get("/wardrobe").set("X-User-Id", "unknown-id");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/unknown user/i);
  });

  it("allows the request through for a known user id", async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [{ id: "1" }] } as never) // requireUser lookup
      .mockResolvedValueOnce({ rows: [] } as never); // GET /wardrobe

    const res = await request(app).get("/wardrobe").set("X-User-Id", "1");

    expect(res.status).toBe(200);
  });
});
