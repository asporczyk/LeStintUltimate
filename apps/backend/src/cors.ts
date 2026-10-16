// Browser origins allowed to call the API and open a Socket.IO connection.
// The app is intentionally public (no login), so this only stops other
// websites from using the API from their visitors' browsers; requests without
// an Origin header (curl, server-to-server) are still accepted.

const DEFAULT_ORIGINS: (string | RegExp)[] = [
    "https://le-stint-ultimate.netlify.app",
    // Netlify deploy previews, e.g. https://deploy-preview-24--le-stint-ultimate.netlify.app
    /^https:\/\/deploy-preview-\d+--le-stint-ultimate\.netlify\.app$/,
    "https://stint-frontend.onrender.com",
    // Local development (Vite picks the next free port when 5173 is taken)
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
];

// CORS_ORIGINS (comma-separated) replaces the defaults, e.g. for a custom domain:
// CORS_ORIGINS=https://stint.example.com,https://le-stint-ultimate.netlify.app
export function getAllowedOrigins(env: string | undefined = process.env.CORS_ORIGINS): (string | RegExp)[] {
    const configured = env?.split(",").map(origin => origin.trim()).filter(Boolean);
    return configured?.length ? configured : DEFAULT_ORIGINS;
}

export function isAllowedOrigin(origin: string, allowed = getAllowedOrigins()): boolean {
    return allowed.some(rule => typeof rule === "string" ? rule === origin : rule.test(origin));
}
