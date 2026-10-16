import { describe, expect, it } from "vitest";
import { clientIp, isCloudflareIp } from "../src/clientIp.js";

const request = (ip: string, cfConnectingIp?: string) => ({
    ip,
    headers: cfConnectingIp ? { "cf-connecting-ip": cfConnectingIp } : {}
});

describe("isCloudflareIp", () => {
    it("recognizes Cloudflare edge addresses seen in production", () => {
        expect(isCloudflareIp("172.69.155.217")).toBe(true);
        expect(isCloudflareIp("162.158.103.155")).toBe(true);
        expect(isCloudflareIp("2606:4700::1")).toBe(true);
    });

    it("rejects other and private addresses", () => {
        expect(isCloudflareIp("203.0.113.9")).toBe(false);
        expect(isCloudflareIp("10.228.25.1")).toBe(false);
        expect(isCloudflareIp("not-an-ip")).toBe(false);
    });
});

describe("clientIp", () => {
    it("uses CF-Connecting-IP when the request came from Cloudflare", () => {
        expect(clientIp(request("172.69.155.217", "203.0.113.9"))).toBe("203.0.113.9");
    });

    it("ignores CF-Connecting-IP from anyone else, so it cannot be faked", () => {
        expect(clientIp(request("203.0.113.50", "198.51.100.1"))).toBe("203.0.113.50");
    });

    it("ignores a header that is not an IP address", () => {
        expect(clientIp(request("172.69.155.217", "nonsense"))).toBe("172.69.155.217");
    });

    it("falls back to the request IP without the header", () => {
        expect(clientIp(request("172.69.155.217"))).toBe("172.69.155.217");
    });
});
