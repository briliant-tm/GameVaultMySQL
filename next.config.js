/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    // Allow both local uploads and external URLs
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Local uploaded images served from /public/uploads are handled automatically
  },
}

module.exports = nextConfig
