import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow SVG backgrounds (the built-in SVGs we ship) and JPEG/PNG/WebP photos
    // that users drop into public/backgrounds/.
    dangerouslyAllowSVG: true,
    // Restrict what the inlined SVG can do — prevents script injection.
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
