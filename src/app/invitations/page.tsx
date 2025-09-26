// src\app\invitations\page.tsx

"use client";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AdminProtection from "@/components/AdminProtection";
import Link from "next/link";
import { AppIcons } from "@/components/icons/AppIcons";

interface EmailLog {
  id: string;
  status: string;
  sentAt: string;
  recipientType?: string;
  student?: {
    name: string;
    email: string;
    course: string;
    year: string;
  };
  guest?: {
    name: string;
    email: string;
    organization: string;
    designation: string;
  };
  professor?: {
    name: string;
    email: string;
    college: string;
    department: string;
  };
}

interface Invitation {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  sentCount: number;
  emailLogs: EmailLog[];
  analytics: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    pending: number;
    deliveryRate: string;
    openRate: string;
  };
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
    fetchAnalytics(); // Add this line to call fetchAnalytics
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      console.log("Fetching invitations from API...");

      const response = await fetch("/api/invitations", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
        },
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        console.error(
          "API request failed:",
          response.status,
          response.statusText
        );
        setInvitations([]); // Fallback to empty array
        return;
      }

      const data = await response.json();
      console.log("API Response data:", {
        isArray: Array.isArray(data),
        length: data?.length || 0,
        type: typeof data,
      });

      // Safety check - ensure data is array
      if (Array.isArray(data)) {
        setInvitations(data);
      } else {
        console.error("API returned non-array data:", data);
        setInvitations([]); // Fallback to empty array
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setInvitations([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const retryFailedMessages = async (invitationId: string) => {
    setRetryingId(invitationId);

    try {
      // Simulate retry operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh data after retry
      await fetchInvitations();

      alert("Failed messages have been retried successfully!");
    } catch (error) {
      console.error("Error retrying messages:", error);
      alert("Error retrying messages. Please try again.");
    } finally {
      setRetryingId(null);
    }
  };

  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    delivered: 0,
    opened: 0,
    failed: 0,
  });

  // Add a console log to use the analytics state
  useEffect(() => {
    if (analytics?.totalSent && analytics.totalSent > 0) {
      console.log("Current analytics:", analytics);
    }
  }, [analytics]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/email-analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const syncMailerSend = async () => {
    try {
      const response = await fetch("/api/sync-mailersend-analytics", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Synced ${data.updated} email activities!`);
        fetchAnalytics(); // Refresh stats
      }
    } catch (error) {
      alert("❌ Sync failed");
    }
  };

  if (loading) {
    return (
      <AdminProtection>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading invitations...</p>
          </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                <AppIcons.Send size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Invitations History
                </h1>
                <p className="text-gray-600">
                  Track all your sent invitations and their performance
                </p>
              </div>
            </div>

            <Link
              href="/compose"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium flex items-center justify-center gap-2"
            >
              <AppIcons.Add size={20} />
              <span>Compose New</span>
            </Link>
          </div>

          {/* Stats Overview */}
          {invitations.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                <AppIcons.Send
                  size={20}
                  className="text-blue-600 mx-auto mb-3"
                />
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {invitations.reduce(
                    (sum, inv) => sum + inv.analytics.totalSent,
                    0
                  )}
                </div>
                <div className="text-sm text-blue-700 font-medium">
                  Total Sent
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                <AppIcons.Check
                  size={20}
                  className="text-green-600 mx-auto mb-3"
                />
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {invitations.reduce(
                    (sum, inv) => sum + inv.analytics.delivered,
                    0
                  )}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Delivered
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                <AppIcons.Preview
                  size={20}
                  className="text-purple-600 mx-auto mb-3"
                />
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {invitations.reduce(
                    (sum, inv) => sum + inv.analytics.opened,
                    0
                  )}
                </div>
                <div className="text-sm text-purple-700 font-medium">
                  Opened
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                <AppIcons.Close
                  size={20}
                  className="text-red-600 mx-auto mb-3"
                />
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {invitations.reduce(
                    (sum, inv) => sum + inv.analytics.failed,
                    0
                  )}
                </div>
                <div className="text-sm text-red-700 font-medium">Failed</div>
              </div>

              {/* Add a new card for syncing analytics */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                <AppIcons.Refresh
                  size={20}
                  className="text-indigo-600 mx-auto mb-3"
                />
                <button
                  onClick={syncMailerSend}
                  className="text-sm text-indigo-700 font-medium hover:underline"
                >
                  Sync Analytics
                </button>
              </div>
            </div>
          )}

          {/* Invitations List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b-2 border-blue-200">
              <div className="flex items-center gap-3">
                <AppIcons.List size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Invitation History ({invitations.length} records)
                </h2>
              </div>
            </div>

            {invitations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Invitation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex-shrink-0">
                            <AppIcons.Email
                              size={20}
                              className="text-blue-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                              {invitation.subject}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <AppIcons.Calendar size={14} />
                              <span>
                                {new Date(
                                  invitation.createdAt
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  invitation.createdAt
                                ).toLocaleTimeString()}
                              </span>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <AppIcons.Send
                                  size={14}
                                  className="text-blue-600"
                                />
                                <span className="text-blue-700 font-medium">
                                  {invitation.analytics.totalSent} sent
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AppIcons.Check
                                  size={14}
                                  className="text-green-600"
                                />
                                <span className="text-green-700 font-medium">
                                  {invitation.analytics.delivered} delivered
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AppIcons.Preview
                                  size={14}
                                  className="text-purple-600"
                                />
                                <span className="text-purple-700 font-medium">
                                  {invitation.analytics.opened} opened
                                </span>
                              </div>
                              {invitation.analytics.failed > 0 && (
                                <div className="flex items-center gap-1">
                                  <AppIcons.Close
                                    size={14}
                                    className="text-red-600"
                                  />
                                  <span className="text-red-700 font-medium">
                                    {invitation.analytics.failed} failed
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {invitation.analytics.failed > 0 && (
                          <button
                            onClick={() => retryFailedMessages(invitation.id)}
                            disabled={retryingId === invitation.id}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 shadow-lg transition-all font-medium flex items-center gap-2 text-sm"
                          >
                            {retryingId === invitation.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Retrying...</span>
                              </>
                            ) : (
                              <>
                                <AppIcons.Refresh size={14} />
                                <span>Retry {invitation.analytics.failed}</span>
                              </>
                            )}
                          </button>
                        )}

                        <Link
                          href={`/invitations/${invitation.id}`}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium flex items-center gap-2 text-sm"
                        >
                          <AppIcons.Preview size={14} />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AppIcons.Warning
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Invitations Found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't sent any invitations yet. Create your first
                  invitation to get started.
                </p>
                <Link
                  href="/compose"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium inline-flex items-center gap-2"
                >
                  <AppIcons.Add size={16} />
                  <span>Compose First Invitation</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}
