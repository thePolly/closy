import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../db/pool", () => ({ pool: { query: vi.fn() } }));

import { createApp } from "../app";
import { pool } from "../db/pool";

const app = createApp();

afterEach(() => {
  vi.mocked(pool.query).mockReset();
});

describe("POST /auth/login", () => {
  it("rejects an empty login", async () => {
    const res = await request(app).post("/auth/login").send({ login: "  " });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/login is required/i);
  });

  it("rejects a login that's too long", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ login: "a".repeat(51) });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too long/i);
  });

  it("creates a new account for a login that doesn't exist yet", async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({ rows: [] } as never) // lookup: not found
      .mockResolvedValueOnce({ rows: [{ id: "1", login: "polina" }] } as never); // INSERT

    const res = await request(app).post("/auth/login").send({ login: "polina" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "1", login: "polina", isNew: true });
  });

  it("logs in to the existing account, matching case-insensitively", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{ id: "1", login: "polina" }],
    } as never); // lookup: found

    const res = await request(app).post("/auth/login").send({ login: "POLINA" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "1", login: "polina", isNew: false });
    expect(pool.query).toHaveBeenCalledOnce(); // no INSERT for an existing login
  });
});
