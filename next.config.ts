import type { NextConfig } from "next";

// Baseline security headers. CSP is intentionally omitted for now — the chat
// pages rely heavily on inline `style` attributes, so adopting CSP requires
// either nonces or a refactor to className-based styling. Add it later.
const securityHeaders = [
  // HTTPS-only for two years; preload-eligible.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Block MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (which may include session ids) to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Prevent clickjacking via iframe embedding.
  { key: "X-Frame-Options", value: "DENY" },
  // Disable powerful APIs we never use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
