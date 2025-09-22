import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

// Safe initialization that doesn't fail during build
try {
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient()
    } else {
      if (!global.__prisma) {
        global.__prisma = new PrismaClient()
      }
      prisma = global.__prisma
    }
  }
} catch (error) {
  console.warn('Prisma initialization failed, using mock client for build')
  prisma = {} as PrismaClient
}

// Ensure prisma is always defined
if (!prisma) {
  prisma = {} as PrismaClient
}

export { prisma }
export default prisma