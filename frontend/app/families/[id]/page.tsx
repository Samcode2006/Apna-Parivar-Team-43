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
      <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 flex justify-between items-start flex-col sm:flex-row gap-6">
            <div>
              <Link href="/dashboard" className="text-white/60 hover:text-white mb-4 inline-flex items-center gap-2 transition">
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">{family?.family_name}</h1>
              <p className="text-muted-foreground mt-3 text-lg">Manage family information and members</p>
            </div>
            {(user?.role === 'family_admin' || user?.role === 'family_co_admin') && (
              <div className="flex gap-3 flex-col sm:flex-row">
                <Link
                  href={`/families/${familyId}/members/new`}
                  className="px-6 py-2.5 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105 text-center"
                >
                  + Add Member
                </Link>
                {user.role === 'family_admin' && (
                  <Link
                    href={`/families/${familyId}/admins`}
                    className="px-6 py-2.5 bg-white/10 border border-white/20 text-foreground font-medium rounded-lg hover:border-white/40 hover:shadow-lg hover:shadow-white/10 transition-all duration-300 text-center"
                  >
                    Manage Admins
                  </Link>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Family Info */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Family Information</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Family Name</dt>
                    <dd className="text-lg text-foreground mt-1">{family?.family_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Family ID</dt>
                    <dd className="text-foreground font-mono text-sm mt-1">{family?.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                    <dd className="text-lg text-foreground mt-1">
                      {family && new Date(family.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Total Members</dt>
                    <dd className="text-lg text-foreground mt-1">{members.length}</dd>
                  </div>
                </dl>
              </div>

              {/* Family Members */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Family Members</h2>
                {members.length === 0 ? (
                  <p className="text-muted-foreground text-lg">No family members yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                      <Link
                        key={member.id}
                        href={`/families/${familyId}/members/${member.id}`}
                        className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105"
                      >
                        {member.photo_url && (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="w-full h-40 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-white transition-colors">{member.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Added: {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
