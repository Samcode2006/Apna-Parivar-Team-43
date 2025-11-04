'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import { PendingAdminRequest } from '@/lib/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, getAllRequests, approveAdminRequest, rejectAdminRequest, logout } = useAuth();
  const [requests, setRequests] = useState<PendingAdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      router.push('/');
      return;
    }

    fetchPendingRequests();
  }, [user, router]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllRequests();
      // The API returns all requests with calculated stats
      const allRequests = response.requests || [];
      setRequests(allRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !adminPassword) {
      setError('Please enter the admin password');
      return;
    }

    try {
      setApproveLoading(true);
      await approveAdminRequest(selectedRequest, adminPassword);
      setApproveModal(false);
      setAdminPassword('');
      setSelectedRequest(null);
      await fetchPendingRequests();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setApproveLoading(true);
      await rejectAdminRequest(selectedRequest, rejectionReason);
      setRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      await fetchPendingRequests();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: requests.length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    pending: requests.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Landing Page Style */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground">SuperAdmin</h1>
              <p className="text-lg text-muted-foreground">Manage admin onboarding requests</p>
            </div>
            {/* <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              Logout */}
            {/* </button> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Requests */}
          <div className="group bg-white/5 border border-border rounded-2xl p-8 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Requests</p>
                <p className="text-4xl font-bold text-foreground mt-3">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="group bg-white/5 border border-border rounded-2xl p-8 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-4xl font-bold text-foreground mt-3">{stats.pending}</p>
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="group bg-white/5 border border-border rounded-2xl p-8 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Approved</p>
                <p className="text-4xl font-bold text-foreground mt-3">{stats.approved}</p>
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div className="group bg-white/5 border border-border rounded-2xl p-8 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rejected</p>
                <p className="text-4xl font-bold text-foreground mt-3">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-destructive/10 border border-destructive/30 rounded-2xl">
            <p className="text-destructive font-medium text-lg">{error}</p>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-background rounded-2xl border border-border overflow-hidden">
          <div className="px-8 py-6 border-b border-border bg-white/2">
            <h2 className="text-2xl font-bold text-foreground">Admin Requests</h2>
            <p className="text-muted-foreground mt-1">Review and manage admin onboarding requests</p>
          </div>

          {requests.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <p className="text-muted-foreground text-lg">No pending requests yet</p>
              <p className="text-muted-foreground text-sm mt-2">All admin requests will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((request) => (
                <div key={request.id} className="px-8 py-6 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{request.full_name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                              : request.status === 'approved'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                              : 'bg-red-500/20 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                          <p className="text-sm text-foreground font-medium">{request.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Family</p>
                          <p className="text-sm text-foreground font-medium">{request.family_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Requested</p>
                          <p className="text-sm text-foreground font-medium">
                            {request.requested_at
                              ? (() => {
                                  const d = new Date(request.requested_at);
                                  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
                                })()
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex gap-3 mt-4 lg:mt-0">
                        <button
                          onClick={() => {
                            setSelectedRequest(request.id);
                            setApproveModal(true);
                          }}
                          className="px-4 py-2 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request.id);
                            setRejectModal(true);
                          }}
                          className="px-4 py-2 bg-[#262626] text-white font-semibold rounded-lg border border-[#262626] hover:border-white hover:bg-transparent transition-all duration-300"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl max-w-md w-full p-8 border border-border shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-2">Approve Admin Request</h2>
            <p className="text-muted-foreground mb-6">Enter the admin password to verify and approve this request:</p>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 outline-none mb-6 bg-background text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setApproveModal(false);
                  setAdminPassword('');
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-3 bg-[#262626] text-white font-semibold rounded-lg border border-[#262626] hover:border-white hover:bg-transparent transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approveLoading}
                className="flex-1 px-4 py-3 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {approveLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl max-w-md w-full p-8 border border-border shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-2">Reject Admin Request</h2>
            <p className="text-muted-foreground mb-6">Provide a reason for rejecting this request:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Rejection reason..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-foreground/20 outline-none mb-6 h-24 resize-none bg-background text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-3 bg-[#262626] text-white font-semibold rounded-lg border border-[#262626] hover:border-white hover:bg-transparent transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={approveLoading}
                className="flex-1 px-4 py-3 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {approveLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
