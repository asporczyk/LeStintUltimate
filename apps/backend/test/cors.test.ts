import { describe, expect, it } from "vitest";
import { getAllowedOrigins, isAllowedOrigin } from "../src/cors.js";

describe("CORS origins", () => {
    const defaults = getAllowedOrigins(undefined);

    it.each([
        "https://le-stint-ultimate.netlify.app",
        "https://deploy-preview-24--le-stint-ultimate.netlify.app",
        "https://stint-frontend.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5174"
    ])("allows %s by default", origin => {
        expect(isAllowedOrigin(origin, defaults)).toBe(true);
    });

    it.each([
        "https://evil.example.com",
        "https://le-stint-ultimate.netlify.app.evil.com",
        "https://deploy-preview-24--other-site.netlify.app",
        "http://le-stint-ultimate.netlify.app",
        "http://localhost.evil.com:5173"
    ])("blocks %s by default", origin => {
        expect(isAllowedOrigin(origin, defaults)).toBe(false);
    });

    it("replaces the defaults with CORS_ORIGINS", () => {
        const allowed = getAllowedOrigins(" https://stint.example.com , https://other.example.com ");
        expect(allowed).toEqual(["https://stint.example.com", "https://other.example.com"]);
        expect(isAllowedOrigin("https://stint.example.com", allowed)).toBe(true);
        expect(isAllowedOrigin("http://localhost:5173", allowed)).toBe(false);
    });

    it("falls back to the defaults when CORS_ORIGINS is empty", () => {
        expect(getAllowedOrigins(" , ")).toEqual(defaults);
    });
});
