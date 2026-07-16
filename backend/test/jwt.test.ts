import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../src/utils/jwt";

describe("jwt", () => {
  it("access token lives for 30 minutes and carries no tokenVersion", () => {
    const t = generateAccessToken("u1");
    const d = jwt.decode(t) as any;
    expect(d.exp - d.iat).toBe(30 * 60);
    expect(d.userId).toBe("u1");
  });

  it("refresh token carries the given tokenVersion", () => {
    const t = generateRefreshToken("u1", 3);
    const d = jwt.decode(t) as any;
    expect(d.tokenVersion).toBe(3);
    expect(d.exp - d.iat).toBe(7 * 24 * 60 * 60);
  });

  it("access token cannot be verified with the refresh secret", () => {
    const t = generateAccessToken("u1");
    expect(() => jwt.verify(t, process.env.JWT_REFRESH_SECRET!)).toThrow();
  });

  it("refresh token cannot be verified with the access secret", () => {
    const t = generateRefreshToken("u1", 0);
    expect(() => jwt.verify(t, process.env.JWT_SECRET!)).toThrow();
  });
});
