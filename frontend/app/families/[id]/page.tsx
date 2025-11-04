'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import { getFamily, getFamilyMembers } from '@/lib/family-service';
import { Family, FamilyMember } from '@/lib/types';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function FamilyDetailPage() {
  const params = useParams();
  const familyId = params.id as string;
  const { user } = useAuth();

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFamilyData();
  }, [familyId]);

  const loadFamilyData = async () => {
    try {
      setIsLoading(true);
      const [familyData, membersData] = await Promise.all([
        getFamily(familyId),
        getFamilyMembers(familyId),
      ]);
      setFamily(familyData);
      setMembers(membersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={['family_admin', 'family_co_admin', 'family_user']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2 flex-1">
                <Link 
                  href="/families" 
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-3 text-sm font-medium"
                >
                  ← Back to Families
                </Link>
                <h1 className="text-5xl sm:text-6xl font-bold text-foreground">{family?.family_name}</h1>
                <p className="text-lg text-muted-foreground">Manage family information and members</p>
              </div>
              {(user?.role === 'family_admin' || user?.role === 'family_co_admin') && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link
                    href={`/families/${familyId}/members/new`}
                    className="px-6 py-3 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105 text-center"
                  >
                    + Add Member
                  </Link>
                  <Link
                    href={`/families/${familyId}/members/bulk-import`}
                    className="px-6 py-3 bg-[#262626] text-white font-semibold rounded-lg border border-[#262626] hover:border-white hover:bg-transparent transition-all duration-300 hover:scale-105 text-center"
                  >
                    📥 Bulk Import
                  </Link>
                  {user.role === 'family_admin' && (
                    <Link
                      href={`/families/${familyId}/admins`}
                      className="px-6 py-3 bg-[#262626] text-white font-semibold rounded-lg border border-[#262626] hover:border-white hover:bg-transparent transition-all duration-300 text-center"
                    >
                      Manage Admins
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="mb-8 p-5 bg-destructive/10 border border-destructive/30 rounded-2xl">
              <p className="text-destructive font-medium text-lg">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-muted-foreground">Loading family details...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Family Info Section */}
              <div className="bg-background rounded-2xl border border-border overflow-hidden">
                <div className="px-8 py-6 border-b border-border bg-white/2">
                  <h2 className="text-2xl font-bold text-foreground">Family Information</h2>
                </div>
                <div className="px-8 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Family Name</p>
                      <p className="text-xl font-semibold text-foreground">{family?.family_name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Family ID</p>
                      <p className="text-lg text-foreground font-mono">{family?.id}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Created Date</p>
                      <p className="text-xl font-semibold text-foreground">
                        {family && new Date(family.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Members</p>
                      <p className="text-xl font-semibold text-foreground">{members.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Members Section */}
              <div className="bg-background rounded-2xl border border-border overflow-hidden">
                <div className="px-8 py-6 border-b border-border bg-white/2">
                  <h2 className="text-2xl font-bold text-foreground">Family Members</h2>
                  <p className="text-muted-foreground mt-1">{members.length} members in this family</p>
                </div>
                <div className="px-8 py-8">
                  {members.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg">No family members yet</p>
                      <p className="text-muted-foreground text-sm mt-2">Add your first member to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {members.map((member) => (
                        <Link
                          key={member.id}
                          href={`/families/${familyId}/members/${member.id}`}
                          className="group bg-white/5 border border-border rounded-2xl p-6 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl"
                        >
                          {member.photo_url && (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="w-full h-40 object-cover rounded-xl mb-4"
                            />
                          )}
                          <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Added: {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
