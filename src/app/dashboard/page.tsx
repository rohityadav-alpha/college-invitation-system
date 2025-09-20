import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminProtection from '@/components/AdminProtection'
import Navigation from '@/components/Navigation'
import { AppIcons } from '@/components/icons/AppIcons'

export default async function Dashboard() {
  const stats = {
    totalStudents: await prisma.student.count(),
    totalInvitations: await prisma.invitation.count(),
    totalEmailsSent: await prisma.emailLog.count(),
  };

  return (
     <AdminProtection>
    <div className="min-h-screen bg-gray-50 text-gray-700">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 justify-center items-center flex flex-col gap-4">
            <AppIcons.Students size={38} />
            <h3 className="text-lg font-medium text-gray-900">
              Total Students
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalStudents}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 justify-center items-center flex flex-col gap-4">
            <AppIcons.List size={38} />
            <h3 className="text-lg font-medium text-gray-900">
              Invitations Created
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalInvitations}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 justify-center items-center flex flex-col gap-4">
            <AppIcons.Email size={38} />
            <h3 className="text-lg font-medium text-gray-900">Emails Sent</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalEmailsSent}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/students"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              <AppIcons.Students size={28} /> Manage Students
            </h3>
            <p className="text-gray-600">
              Add, edit, or import student email lists
            </p>
          </Link>

          <Link
            href="/compose"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              <AppIcons.Send size={24} /> Create Invitation
            </h3>
            <p className="text-gray-600">Compose and send event invitations</p>
          </Link>

          <Link
            href="/invitations"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
               Invitation History
            </h3>
            <p className="text-gray-600">
              View sent invitations and delivery status
            </p>
          </Link>

          <Link
            href="/email-test"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
               Email Test
            </h3>
            <p className="text-gray-600">Test email service functionality</p>
          </Link>
        </div>
      </div>
    </div>
    </AdminProtection>
  );
}
