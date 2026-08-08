import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../db/pool", () => ({ pool: { query: vi.fn() } }));
vi.mock("../middleware/requireUser", () => ({
  requireUser: (req: never, _res: never, next: () => void) => {
    (req as { userId: string }).userId = "test-user-id";
    next();
  },
}));

import { createApp } from "../app";
import { pool } from "../db/pool";

const app = createApp();

afterEach(() => {
  vi.mocked(pool.query).mockReset();
});

describe("GET /users/me", () => {
  it("returns the current user's profile", async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: "test-user-id", login: "polina", age_group: "30s", style_preference: null }],
    } as never);

    const res = await request(app).get("/users/me");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: "test-user-id",
      login: "polina",
      age_group: "30s",
      style_preference: null,
    });
  });
});

describe("PATCH /users/me", () => {
  it("updates age_group only, leaving style_preference untouched", async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: "test-user-id", login: "polina", age_group: "40s", style_preference: "Casual" }],
    } as never);

    const res = await request(app).patch("/users/me").send({ age_group: "40s" });

    expect(res.status).toBe(200);
    expect(res.body.age_group).toBe("40s");
    const params = vi.mocked(pool.query).mock.calls[0][1] as unknown[];
    expect(params).toEqual(["40s", null, "test-user-id"]);
  });

  it("updates both fields when both are provided", async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [
        { id: "test-user-id", login: "polina", age_group: "20s", style_preference: "Streetwear" },
      ],
    } as never);

    const res = await request(app)
      .patch("/users/me")
      .send({ age_group: "20s", style_preference: "Streetwear" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: "test-user-id",
      login: "polina",
      age_group: "20s",
      style_preference: "Streetwear",
    });
  });

  it("rejects a blank age_group", async () => {
    const res = await request(app).patch("/users/me").send({ age_group: "   " });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/age_group/);
  });

  it("rejects a style_preference that's too long", async () => {
    const res = await request(app)
      .patch("/users/me")
      .send({ style_preference: "a".repeat(31) });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/style_preference/);
  });
});
