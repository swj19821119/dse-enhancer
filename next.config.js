/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      {
        module: /node_modules\/skills/
      },
      {
        module: /skills/
      }
    ];
    return config;
  },
};

module.exports = nextConfig;
