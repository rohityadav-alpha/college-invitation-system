"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppIcons } from "@/components/icons/AppIcons";
import Navigation from "@/components/Navigation";
import AdminProtection from "@/components/AdminProtection";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/invitations");
      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const retryFailedMessages = async (invitationId: string) => {
    setRetryingId(invitationId);
    try {
      await fetch(`/api/invitations/${invitationId}/retry`, {
        method: "POST",
      });
      fetchInvitations();
    } catch (error) {
      console.error("Error retrying messages:", error);
    } finally {
      setRetryingId(null);
    }
  };

  const getRecipientInfo = (log: any) => {
    if (log.student) {
      return {
        name: log.student.name,
        email: log.student.email,
        type: "Student",
        details: `${log.student.course} - ${log.student.year}`,
        icon: "S",
      };
    }
    if (log.guest) {
      return {
        name: log.guest.name,
        email: log.guest.email,
        type: "Guest",
        details: `${log.guest.organization} - ${log.guest.designation}`,
        icon: "G",
      };
    }
    if (log.professor) {
      return {
        name: log.professor.name,
        email: log.professor.email,
        type: "Professor",
        details: `${log.professor.college} - ${log.professor.department}`,
        icon: "P",
      };
    }
    return {
      name: "Unknown",
      email: "",
      type: "Unknown",
      details: "",
      icon: "U",
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "opened":
      case "read":
        return "bg-blue-100 text-blue-800";
      case "clicked":
        return "bg-purple-100 text-purple-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "sent":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAllLogs = (invitation: any) => {
    const emailLogs = (invitation.emailLogs || []).map((log: any) => ({
      ...log,
      channel: "email",
    }));
    const smsLogs = (invitation.smsLogs || []).map((log: any) => ({
      ...log,
      channel: "sms",
    }));
    const whatsappLogs = (invitation.whatsappLogs || []).map((log: any) => ({
      ...log,
      channel: "whatsapp",
    }));
    return [...emailLogs, ...smsLogs, ...whatsappLogs];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AdminProtection>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <AppIcons.Zap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Multi-Channel Communications
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Track emails, SMS, and WhatsApp messages
              </p>
            </div>
          </div>

          <Link
            href="/compose"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium flex items-center justify-center gap-2"
          >
            <AppIcons.Send size={18} />
            <span className="text-sm sm:text-base">Create New Invitation</span>
          </Link>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <AppIcons.Send size={48} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
              No Communications Yet
            </h3>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">
              Start by creating your first multi-channel campaign
            </p>
            <Link
              href="/compose"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium"
            >
              <AppIcons.Send size={18} />
              <span>Create Campaign</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {invitations.map((invitation: any) => {
              const allLogs = getAllLogs(invitation);

              return (
                <div
                  key={invitation.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Enhanced Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-0 mb-6 sm:mb-8">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-md flex-shrink-0">
                        <AppIcons.Send size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
                          {invitation.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-700 mb-3 break-words">
                          {invitation.subject}
                        </p>
                        <div className="flex items-center gap-2">
                          <AppIcons.Calendar
                            size={14}
                            className="text-gray-500 flex-shrink-0"
                          />
                          <p className="text-xs sm:text-sm text-gray-500">
                            Created:{" "}
                            {new Date(
                              invitation.createdAt
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              invitation.createdAt
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
                        <AppIcons.Check size={16} className="text-blue-600" />
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          <span className="text-blue-600">
                            {invitation.analytics.totalSent}
                          </span>{" "}
                          messages sent
                        </p>
                      </div>
                      {invitation.analytics.failed > 0 && (
                        <button
                          onClick={() => retryFailedMessages(invitation.id)}
                          disabled={retryingId === invitation.id}
                          className="w-full text-xs sm:text-sm bg-gradient-to-r from-red-100 to-red-200 text-red-700 px-3 py-2 rounded-lg hover:from-red-200 hover:to-red-300 disabled:opacity-50 transition-all font-medium shadow-md flex items-center justify-center gap-2"
                        >
                          {retryingId === invitation.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-600 border-t-transparent"></div>
                              <span>Retrying...</span>
                            </>
                          ) : (
                            <>
                              <AppIcons.Refresh size={14} />
                              <span>
                                Retry {invitation.analytics.failed} Failed
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Multi-Channel Analytics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl border-2 border-blue-200 text-center hover:shadow-lg transition-all">
                      <div className="flex items-center justify-center mb-2">
                        <AppIcons.Send size={16} className="text-blue-600" />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">
                        {invitation.analytics.totalSent}
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 font-medium">
                        Total Sent
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl border-2 border-green-200 text-center hover:shadow-lg transition-all">
                      <div className="flex items-center justify-center mb-2">
                        <AppIcons.Check size={16} className="text-green-600" />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
                        {invitation.analytics.delivered}
                      </p>
                      <p className="text-xs sm:text-sm text-green-700 font-medium">
                        Delivered
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl border-2 border-purple-200 text-center hover:shadow-lg transition-all">
                      <div className="flex items-center justify-center mb-2">
                        <AppIcons.Preview
                          size={16}
                          className="text-purple-600"
                        />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">
                        {invitation.analytics.email.opened +
                          (invitation.analytics.whatsapp.read || 0)}
                      </p>
                      <p className="text-xs sm:text-sm text-purple-700 font-medium">
                        Opened/Read
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-4 rounded-xl border-2 border-indigo-200 text-center hover:shadow-lg transition-all">
                      <div className="flex items-center justify-center mb-2">
                        <AppIcons.ExternalLink
                          size={16}
                          className="text-indigo-600"
                        />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-indigo-600 mb-1">
                        {invitation.analytics.email.clicked || 0}
                      </p>
                      <p className="text-xs sm:text-sm text-indigo-700 font-medium">
                        Clicked
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 sm:p-4 rounded-xl border-2 border-red-200 text-center hover:shadow-lg transition-all">
                      <div className="flex items-center justify-center mb-2">
                        <AppIcons.Close size={16} className="text-red-600" />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-red-600 mb-1">
                        {invitation.analytics.failed}
                      </p>
                      <p className="text-xs sm:text-sm text-red-700 font-medium">
                        Failed
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-xl border-2 border-yellow-200 text-center hover:shadow-lg transition-all">
                      <div className="flex items-center justify-center mb-2">
                        <AppIcons.Clock size={16} className="text-yellow-600" />
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-yellow-600 mb-1">
                        {invitation.analytics.pending}
                      </p>
                      <p className="text-xs sm:text-sm text-yellow-700 font-medium">
                        Pending
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Channel Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-200 rounded-lg">
                          <AppIcons.Email size={18} className="text-blue-800" />
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-blue-900">
                          Email
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex justify-between items-center">
                          <span>Sent:</span>
                          <span className="font-bold">
                            {invitation.analytics.email.totalSent}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Delivered:</span>
                          <span className="font-bold text-green-600">
                            {invitation.analytics.email.delivered}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Opened:</span>
                          <span className="font-bold text-purple-600">
                            {invitation.analytics.email.opened}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-200 rounded-lg">
                          <AppIcons.Phone
                            size={18}
                            className="text-green-800"
                          />
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-green-900">
                          SMS
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm text-green-800">
                        <div className="flex justify-between items-center">
                          <span>Sent:</span>
                          <span className="font-bold">
                            {invitation.analytics.sms.totalSent}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Delivered:</span>
                          <span className="font-bold text-green-600">
                            {invitation.analytics.sms.delivered}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Failed:</span>
                          <span className="font-bold text-red-600">
                            {invitation.analytics.sms.failed}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-200 rounded-lg">
                          <AppIcons.WhatsApp
                            size={18}
                            className="text-purple-800"
                          />
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-purple-900">
                          WhatsApp
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm text-purple-800">
                        <div className="flex justify-between items-center">
                          <span>Sent:</span>
                          <span className="font-bold">
                            {invitation.analytics.whatsapp.totalSent}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Delivered:</span>
                          <span className="font-bold text-green-600">
                            {invitation.analytics.whatsapp.delivered}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Read:</span>
                          <span className="font-bold text-blue-600">
                            {invitation.analytics.whatsapp.read}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Rates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <AppIcons.Info size={20} className="text-gray-600" />
                        <p className="text-sm sm:text-base text-gray-700 font-medium">
                          Overall Delivery Rate
                        </p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {invitation.analytics.totalSent > 0
                          ? (
                              (invitation.analytics.delivered /
                                invitation.analytics.totalSent) *
                              100
                            ).toFixed(1)
                          : "0"}
                        %
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <AppIcons.Preview size={20} className="text-gray-600" />
                        <p className="text-sm sm:text-base text-gray-700 font-medium">
                          Email Open Rate
                        </p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {invitation.analytics.email.openRate}%
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Message Logs Summary */}
                  <div className="border-t-2 border-gray-200 pt-4 sm:pt-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <AppIcons.List size={18} className="text-gray-600" />
                      <h4 className="text-sm sm:text-base font-bold text-gray-900">
                        Recent Message Status
                      </h4>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {allLogs.slice(0, 10).map((log: any) => {
                          const recipientInfo = getRecipientInfo(log);
                          const channelPrefix =
                            log.channel === "email"
                              ? "E"
                              : log.channel === "sms"
                              ? "S"
                              : "W";

                          return (
                            <span
                              key={`${log.channel}-${log.id}`}
                              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border-2 transition-all hover:shadow-md ${getStatusColor(
                                log.status
                              )}`}
                              title={`${recipientInfo.name} (${log.channel}) - ${log.status} - ${recipientInfo.type}`}
                            >
                              [{channelPrefix}] {recipientInfo.name} -{" "}
                              {log.status}
                            </span>
                          );
                        })}
                        {allLogs.length > 10 && (
                          <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 border-2 border-gray-400">
                            +{allLogs.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced View Details Link */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200">
                    <Link
                      href={`/invitations/${invitation.id}`}
                      className="flex items-center justify-between group hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 rounded-xl p-3 sm:p-4 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <AppIcons.Preview
                            size={16}
                            className="text-blue-600"
                          />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-blue-700 group-hover:text-blue-900">
                          View Detailed Analytics
                        </span>
                      </div>
                      <AppIcons.ArrowRight
                        size={16}
                        className="text-blue-600 group-hover:text-blue-800 group-hover:translate-x-1 transition-all"
                      />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </AdminProtection>
  );
}
