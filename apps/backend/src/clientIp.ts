import { BlockList, isIP } from "node:net";
import type { FastifyRequest } from "fastify";

// Cloudflare's published edge ranges (https://www.cloudflare.com/ips/).
const CLOUDFLARE_IPV4 = [
    "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
    "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20",
    "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
    "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22"
];
const CLOUDFLARE_IPV6 = [
    "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32",
    "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32"
];

const cloudflare = new BlockList();
for (const range of CLOUDFLARE_IPV4) {
    const [address, prefix] = range.split("/");
    cloudflare.addSubnet(address, Number(prefix), "ipv4");
}
for (const range of CLOUDFLARE_IPV6) {
    const [address, prefix] = range.split("/");
    cloudflare.addSubnet(address, Number(prefix), "ipv6");
}

export function isCloudflareIp(ip: string): boolean {
    const version = isIP(ip);
    return version !== 0 && cloudflare.check(ip, version === 4 ? "ipv4" : "ipv6");
}

// The client IP used for rate limiting. Render sits behind Cloudflare, so req.ip
// (see trustProxy in server.ts) is a Cloudflare edge server that changes between
// requests. Cloudflare puts the real client IP in CF-Connecting-IP and overwrites any
// value the client sends, so the header is used only when the request really came
// from a Cloudflare address; otherwise anyone could set it.
export function clientIp(req: Pick<FastifyRequest, "ip" | "headers">): string {
    const header = req.headers["cf-connecting-ip"];
    const connectingIp = Array.isArray(header) ? header[0] : header;
    if (connectingIp && isIP(connectingIp) && isCloudflareIp(req.ip)) {
        return connectingIp;
    }
    return req.ip;
}
