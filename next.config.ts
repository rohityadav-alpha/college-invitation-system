// D:\college-invitation-system\next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { 
    ignoreDuringBuilds: true 
  },
  typescript: { 
    ignoreBuildErrors: true 
  },
  
  // Add proper config to skip problematic routes during build
  experimental: {
    serverComponentsExternalPackages: ['@sendgrid/mail', 'twilio']
  },
  
  // Skip static optimization for API routes
  output: 'standalone'
}

export default nextConfig

