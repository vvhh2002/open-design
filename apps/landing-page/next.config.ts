import type { NextConfig } from 'next';

// The landing page is a fully static marketing site — no APIs, no SSR
// data, no client-side state. Default to a static export so it can be
// served by any CDN (Vercel, Cloudflare Pages, the daemon's static
// fallback) without a Node runtime.
const isProd = process.env.NODE_ENV !== 'development';
const shouldStaticExport = isProd && process.env.OD_LANDING_OUTPUT_MODE !== 'server';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(shouldStaticExport
    ? {
        output: 'export' as const,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
