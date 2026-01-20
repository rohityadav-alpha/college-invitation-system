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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <AppIcons.Dashboard size={24} className="text-white" />
              </div>
            <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your invitation system</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        
      </div>

      {/* Enhanced Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 justify-center items-center flex flex-col gap-3 sm:gap-4 lg:gap-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
              <AppIcons.Students size={38} className="text-blue-600 group-hover:text-blue-700 transition-colors" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 text-center">
              Total Students
            </h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
              {stats.totalStudents}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 justify-center items-center flex flex-col gap-3 sm:gap-4 lg:gap-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-full group-hover:from-green-200 group-hover:to-green-300 transition-all">
              <AppIcons.List size={38} className="text-green-600 group-hover:text-green-700 transition-colors" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 text-center">
              Invitations Created
            </h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 group-hover:text-green-700 transition-colors">
              {stats.totalInvitations}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 justify-center items-center flex flex-col gap-3 sm:gap-4 lg:gap-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full group-hover:from-purple-200 group-hover:to-purple-300 transition-all">
              <AppIcons.Email size={38} className="text-purple-600 group-hover:text-purple-700 transition-colors" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 text-center">
              Emails Sent
            </h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors">
              {stats.totalEmailsSent}
            </p>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <AppIcons.Rocket size={24} className="text-indigo-600" />
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Link
            href="/students"
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                <AppIcons.Students size={28} className="text-blue-600 group-hover:text-blue-700 transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Manage Students
                </h3>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                  Add, edit, or import student email lists
                </p>
              </div>
              <AppIcons.ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/compose"
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                <AppIcons.Send size={24} className="text-green-600 group-hover:text-green-700 transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Create Invitation
                </h3>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                  Compose and send event invitations
                </p>
              </div>
              <AppIcons.ArrowRight size={20} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/invitations"
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                <AppIcons.List size={24} className="text-purple-600 group-hover:text-purple-700 transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Invitation History
                </h3>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                  View sent invitations and delivery status
                </p>
              </div>
              <AppIcons.ArrowRight size={20} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/email-test"
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl group-hover:from-orange-200 group-hover:to-yellow-200 transition-all">
                <AppIcons.Email size={24} className="text-orange-600 group-hover:text-orange-700 transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Email Test
                </h3>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                  Test email service functionality
                </p>
              </div>
              <AppIcons.ArrowRight size={20} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>
    </div>

    </AdminProtection>
  );
}
