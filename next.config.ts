/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Skip API routes during build
  experimental: {
    outputFileTracingIgnores: ['**/api/**']
  }
}

export default nextConfig

