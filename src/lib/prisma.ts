import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

try {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'postgresql://dummy:dummy@localhost:5432/dummy') {
    prisma = new PrismaClient()
  } else {
    // Mock Prisma for build time
    prisma = {
      student: { findMany: () => [], create: () => {}, update: () => {}, delete: () => {} },
      guest: { findMany: () => [], create: () => {}, update: () => {}, delete: () => {} },
      professor: { findMany: () => [], create: () => {}, update: () => {}, delete: () => {} }
    } as any
  }
} catch (error) {
  console.warn('Prisma initialization failed, using mock client')
  prisma = {} as PrismaClient
}

export default prisma