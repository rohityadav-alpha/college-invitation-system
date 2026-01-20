import { prisma } from '@/lib/prisma'
import AdminProtection from '@/components/AdminProtection'

export default async function TestPage() {
  // Test database connection
  const studentCount = await prisma.student.count()
  
  return (
    <AdminProtection>
    <div className="p-8">
      <h1 className="text-2xl font-bold">Database Test</h1>
      <p>Students in database: {studentCount}</p>
      <p>✅ Database connection successful!</p>
    </div>
    </AdminProtection>
  )
}
