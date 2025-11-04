'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import { PendingAdminRequest } from '@/lib/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, getPendingRequests, approveAdminRequest, rejectAdminRequest, logout } = useAuth();
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
      const response = await getPendingRequests();
      setRequests(response.requests || []);
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
      {/* Header - use landing-like container/padding and larger title to match theme */}
      <div className="bg-card border-b border-border shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">SuperAdmin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage family admin onboarding requests</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <div className="text-sm text-muted-foreground font-medium">Total Requests</div>
            <div className="text-3xl font-bold text-card-foreground">{stats.total}</div>
          </div>
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <div className="text-sm text-accent font-medium">Pending</div>
            <div className="text-3xl font-bold text-accent">{stats.pending}</div>
          </div>
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <div className="text-sm text-primary font-medium">Approved</div>
            <div className="text-3xl font-bold text-primary">{stats.approved}</div>
          </div>
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <div className="text-sm text-destructive font-medium">Rejected</div>
            <div className="text-3xl font-bold text-destructive">{stats.rejected}</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-card-foreground">Pending Admin Requests</h2>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground text-lg">No pending requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Family Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-background/50 transition">
                      <td className="px-6 py-4 text-sm text-card-foreground">{request.email}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{request.full_name}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{request.family_name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {request.requested_at
                          ? (() => {
                              const d = new Date(request.requested_at);
                              return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
                            })()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'pending'
                              ? 'bg-accent/10 text-accent'
                              : request.status === 'approved'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request.id);
                                setApproveModal(true);
                              }}
                              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request.id);
                                setRejectModal(true);
                              }}
                              className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded hover:opacity-90 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 border border-border">
            <h2 className="text-xl font-bold text-card-foreground mb-4">Approve Admin Request</h2>
            <p className="text-muted-foreground mb-4">
              Enter the admin's password to verify and approve this request:
            </p>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none mb-4 bg-background text-foreground"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setApproveModal(false);
                  setAdminPassword('');
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approveLoading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
              >
                {approveLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 border border-border">
            <h2 className="text-xl font-bold text-card-foreground mb-4">Reject Admin Request</h2>
            <p className="text-muted-foreground mb-4">Provide a reason for rejecting this request:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Rejection reason..."
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none mb-4 h-24 resize-none bg-background text-foreground"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={approveLoading}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
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
