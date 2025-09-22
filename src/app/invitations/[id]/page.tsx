"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppIcons } from "@/components/icons/AppIcons";
import { Radio } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdminProtection from "@/components/AdminProtection";

export default function InvitationDetailPage() {
  const params = useParams();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all"); // New filter for channels
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchInvitation();
    }
  }, [params.id]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInvitation(data);
      } else {
        setInvitation(null);
      }
    } catch (error) {
      console.error("Error fetching invitation:", error);
      setInvitation(null);
    } finally {
      setLoading(false);
    }
  };

  const retryFailedMessages = async () => {
    setRetrying(true);
    try {
      await fetch(`/api/invitations/${params.id}/retry`, {
        method: "POST",
      });
      fetchInvitation();
    } catch (error) {
      console.error("Error retrying messages:", error);
    } finally {
      setRetrying(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return "D";
      case "opened":
        return "O";
      case "read":
        return "R";
      case "clicked":
        return "C";
      case "failed":
        return "F";
      case "sent":
        return "S";
      default:
        return "-";
    }
  };

  const getAllLogs = () => {
    if (!invitation) return [];

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

  const getFilteredLogs = () => {
    const allLogs = getAllLogs();

    let filtered = allLogs;

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((log) => log.status === filter);
    }

    // Filter by channel
    if (channelFilter !== "all") {
      filtered = filtered.filter((log) => log.channel === channelFilter);
    }

    return filtered.sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  };

  const getStats = () => {
    const allLogs = getAllLogs();

    return {
      total: allLogs.length,
      delivered: allLogs.filter((log) => log.status === "delivered").length,
      opened: allLogs.filter((log) => ["opened", "read"].includes(log.status))
        .length,
      clicked: allLogs.filter((log) => log.status === "clicked").length,
      failed: allLogs.filter((log) => log.status === "failed").length,
      pending: allLogs.filter((log) => log.status === "sent").length,
    };
  };

  const getRecipientStats = () => {
    const allLogs = getAllLogs();

    return {
      students: allLogs.filter((log) => log.student).length,
      guests: allLogs.filter((log) => log.guest).length,
      professors: allLogs.filter((log) => log.professor).length,
    };
  };

  const getChannelStats = () => {
    const allLogs = getAllLogs();

    return {
      email: allLogs.filter((log) => log.channel === "email").length,
      sms: allLogs.filter((log) => log.channel === "sms").length,
      whatsapp: allLogs.filter((log) => log.channel === "whatsapp").length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invitation Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The invitation you're looking for doesn't exist.
          </p>
          <Link
            href="/invitations"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const recipientStats = getRecipientStats();
  const channelStats = getChannelStats();
  const filteredLogs = getFilteredLogs();

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-600">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/invitations"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all font-medium"
              >
                <AppIcons.ArrowLeft size={16} />
                <span className="text-sm sm:text-base">Back to History</span>
              </Link>
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <AppIcons.Preview size={20} className="text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Campaign Details
                </h1>
              </div>
            </div>

            {stats.failed > 0 && (
              <button
                onClick={retryFailedMessages}
                disabled={retrying}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 shadow-lg transition-all font-medium flex items-center justify-center gap-2"
              >
                {retrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <AppIcons.Refresh size={16} />
                    <span>Retry {stats.failed} Failed</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Enhanced Invitation Info */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-md flex-shrink-0">
                <AppIcons.Send size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 break-words">
                  {invitation.subject}
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <AppIcons.Calendar size={16} className="flex-shrink-0" />
                  <p className="text-sm sm:text-base">
                    Created: {new Date(invitation.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl shadow-lg border-2 border-blue-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Send size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                {stats.total}
              </div>
              <div className="text-xs sm:text-sm text-blue-700 font-medium">
                Total Sent
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl shadow-lg border-2 border-green-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Check size={20} className="text-green-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                {stats.delivered}
              </div>
              <div className="text-xs sm:text-sm text-green-700 font-medium">
                Delivered
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl shadow-lg border-2 border-purple-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Preview size={20} className="text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
                {stats.opened}
              </div>
              <div className="text-xs sm:text-sm text-purple-700 font-medium">
                Opened
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl sm:rounded-2xl shadow-lg border-2 border-indigo-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.ExternalLink size={20} className="text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2">
                {stats.clicked}
              </div>
              <div className="text-xs sm:text-sm text-indigo-700 font-medium">
                Clicked
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl shadow-lg border-2 border-red-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Close size={20} className="text-red-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                {stats.failed}
              </div>
              <div className="text-xs sm:text-sm text-red-700 font-medium">
                Failed
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl sm:rounded-2xl shadow-lg border-2 border-yellow-200 p-4 sm:p-6 text-center hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Clock size={20} className="text-yellow-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">
                {stats.pending}
              </div>
              <div className="text-xs sm:text-sm text-yellow-700 font-medium">
                Pending
              </div>
            </div>
          </div>

          {/* Enhanced Recipient and Channel Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Enhanced Recipient Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-md">
                  <AppIcons.User size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Recipients
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AppIcons.Students size={18} className="text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                    {recipientStats.students}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700 font-medium">
                    Students
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AppIcons.Guests size={18} className="text-green-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                    {recipientStats.guests}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700 font-medium">
                    Guests
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AppIcons.User size={18} className="text-purple-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                    {recipientStats.professors}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700 font-medium">
                    Professors
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Channel Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl shadow-md">
                  <AppIcons.Rocket size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Channels
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AppIcons.Email size={18} className="text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                    {channelStats.email}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700 font-medium">
                    Email
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AppIcons.Phone size={18} className="text-green-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                    {channelStats.sms}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700 font-medium">
                    SMS
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AppIcons.WhatsApp size={18} className="text-purple-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                    {channelStats.whatsapp}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700 font-medium">
                    WhatsApp
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
                <AppIcons.Filter size={18} className="text-gray-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Filter Options
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              {/* Status Filter */}
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <AppIcons.Filter size={16} />
                  Filter by Status:
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="opened">Opened</option>
                  <option value="read">Read</option>
                  <option value="clicked">Clicked</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Channel Filter */}
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <AppIcons.Filter size={16} />
                  Filter by Channel:
                </label>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="all">All Channels</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Logs Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 sm:py-6 border-b-2 border-blue-200">
              <div className="flex items-center gap-3">
                <AppIcons.List size={20} className="text-blue-600" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Message Logs ({filteredLogs.length} records)
                </h3>
              </div>
            </div>

            {filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.User size={14} />
                          Recipient
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Rocket size={14} />
                          Channel
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.List size={14} />
                          Type
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Info size={14} />
                          Details
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Check size={14} />
                          Status
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Clock size={14} />
                          Sent At
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Warning size={14} />
                          Error
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredLogs.map((log) => {
                      const recipientInfo = getRecipientInfo(log);
                      const contact =
                        log.channel === "email"
                          ? recipientInfo.email
                          : log.phoneNumber ||
                            log.student?.phone ||
                            log.guest?.phone ||
                            log.professor?.phone;

                      return (
                        <tr
                          key={`${log.channel}-${log.id}`}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all"
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
                                  {recipientInfo.icon}
                                </span>
                                {recipientInfo.name}
                              </div>
                              <div className="text-gray-600 text-xs mt-1">
                                {contact}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                                log.channel === "email"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : log.channel === "sms"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-purple-100 text-purple-800 border-purple-300"
                              }`}
                            >
                              {log.channel.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {recipientInfo.type}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {recipientInfo.details}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                                log.status === "delivered"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : ["opened", "read"].includes(log.status)
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : log.status === "clicked"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : log.status === "failed"
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
                              }`}
                            >
                              [{getStatusIcon(log.status)}] {log.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(log.sentAt).toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {log.errorMessage && (
                              <div className="flex items-center gap-2">
                                <AppIcons.Warning size={14} />
                                <span
                                  title={log.errorMessage}
                                  className="truncate max-w-xs"
                                >
                                  {log.errorMessage.substring(0, 30)}...
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 sm:px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <AppIcons.Search size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base">
                    {filter === "all" && channelFilter === "all"
                      ? "No messages found"
                      : `No messages found with status: ${filter} and channel: ${channelFilter}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}
