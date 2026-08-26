import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Every image is a local asset already sized for its slot, so the optimizer
  // would only add a hop. Served straight from /public behind the CDN.
  images: { unoptimized: true },
};

export default nextConfig;
