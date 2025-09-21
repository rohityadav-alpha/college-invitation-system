/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { 
    ignoreDuringBuilds: true 
  },
  typescript: { 
    ignoreBuildErrors: true 
  },
  
  // Updated for Next.js 15
  serverExternalPackages: ['@sendgrid/mail', 'nodemailer', '@prisma/client'],
  
  // Skip static optimization for problematic pages
  output: 'standalone',
  
  // Disable static generation for dashboard
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
}

export default nextConfig
