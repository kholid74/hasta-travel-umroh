import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sumber foto hanya selebar 1920px — meminta varian 3840px cuma memperbesar
    // gambar tanpa menambah detail, dan memperlambat render pertama.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

export default nextConfig;
