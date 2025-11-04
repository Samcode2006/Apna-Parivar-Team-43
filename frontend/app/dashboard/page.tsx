'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import Link from 'next/link';

interface DashboardStats {
  familiesCount?: number;
  adminsCount?: number;
  familyMembersCount?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    // Redirect based on role
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'super_admin') {
        router.replace('/admin');
      } else if (user.role === 'family_admin' || user.role === 'family_co_admin') {
        router.replace('/admin/dashboard');
      } else if (user.role === 'family_user') {
        router.replace('/families');
      }
    } else if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [user, isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Stats will be fetched based on role
    if (user?.role === 'super_admin') {
      // Fetch all families for super admin
      setStats({ familiesCount: 0 });
    } else if (user?.role === 'family_admin' || user?.role === 'family_co_admin') {
      // Fetch family-specific data
      setStats({ adminsCount: 0, familyMembersCount: 0 });
    }
  }, [user]);

  const renderRoleSpecificContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'super_admin':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Super Admin Dashboard</h2>
              <p className="text-muted-foreground">Manage all families and admins on the platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/families"
                className="group p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-white transition-colors">Manage Families</h3>
                    <p className="text-muted-foreground mt-2 group-hover:text-foreground/80 transition-colors">View and manage all families on the platform</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admins"
                className="group p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-white transition-colors">Manage Admins</h3>
                    <p className="text-muted-foreground mt-2 group-hover:text-foreground/80 transition-colors">Invite and manage family admins</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        );

      case 'family_admin':
      case 'family_co_admin':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Family Admin Dashboard</h2>
              <p className="text-muted-foreground">Manage your family and members</p>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400">
                <strong>Family Status:</strong> {user.family_id ? <span className="text-green-300">Connected ✓</span> : <span className="text-yellow-300">Not assigned</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href={`/families/${user.family_id}`}
                className="group p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-white transition-colors">Family Tree</h3>
                    <p className="text-muted-foreground mt-2 group-hover:text-foreground/80 transition-colors">View and manage family members</p>
                  </div>
                </div>
              </Link>

              <Link
                href={`/families/${user.family_id}/members`}
                className="group p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-white transition-colors">Members</h3>
                    <p className="text-muted-foreground mt-2 group-hover:text-foreground/80 transition-colors">Add and manage family members</p>
                  </div>
                </div>
              </Link>

              {user.role === 'family_admin' && (
                <Link
                  href={`/families/${user.family_id}/admins`}
                  className="group p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-white transition-colors">Co-Admins</h3>
                      <p className="text-muted-foreground mt-2 group-hover:text-foreground/80 transition-colors">Add and manage co-administrators</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        );

      case 'family_user':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Family Dashboard</h2>
              <p className="text-muted-foreground">Welcome to your family</p>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <h3 className="text-xl font-semibold text-foreground mb-4">Welcome!</h3>
              <p className="text-muted-foreground mb-6">
                You are a member of this family. You can view family members and information.
              </p>
              <Link
                href={`/families/${user.family_id}`}
                className="inline-block py-2.5 px-8 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105"
              >
                View Family Tree
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* User Info */}
          <div className="mb-8 p-6 sm:p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5">
            <div className="flex justify-between items-start flex-col sm:flex-row">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Welcome back!</h1>
                <p className="text-muted-foreground mt-2">{user?.email}</p>
                <span className="mt-4 inline-block px-4 py-2 bg-white/10 border border-white/20 text-foreground rounded-full text-sm font-medium">
                  {user?.role.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Role-specific content */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5 p-6 sm:p-8">
            {renderRoleSpecificContent()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
