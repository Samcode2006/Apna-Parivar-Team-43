'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import Link from 'next/link';
import { getFamily, getFamilyMembers, createFamilyMember, deleteFamilyMember } from '@/lib/family-service';
import { FamilyMember } from '@/lib/types';

interface FamilyDetails {
  id: string;
  name: string;
  admin_email: string;
  admin_name: string;
  created_at: string;
  member_count: number;
  members?: FamilyMember[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const [familyDetails, setFamilyDetails] = useState<FamilyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    relationship: '',
  });
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'family_admin') {
      router.push('/admin-login');
      return;
    }

    // Fetch family details
    fetchFamilyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role, user?.family_id]);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      if (!user?.family_id) {
        throw new Error('No family ID found');
      }

      // Fetch family details from API
      const family = await getFamily(user.family_id);
      
      // Fetch family members from API
      const members = await getFamilyMembers(user.family_id);

      const familyDetails: FamilyDetails = {
        id: family.id,
        name: family.family_name,
        admin_email: user?.email || '',
        admin_name: user?.full_name || 'Admin',
        created_at: family.created_at,
        member_count: members.length,
        members: members,
      };

      setFamilyDetails(familyDetails);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newMember.name.trim()) {
      setError('Please enter member name');
      return;
    }
    if (!newMember.relationship.trim()) {
      setError('Please select a relationship');
      return;
    }

    if (!user?.family_id) {
      setError('No family ID found');
      return;
    }

    try {
      setAddMemberLoading(true);
      
      // Call API to add family member
      const relationships: Record<string, string> = {
        relationship: newMember.relationship,
        ...(newMember.email ? { email: newMember.email } : {}),
      };

      const createdMember = await createFamilyMember(
        user.family_id,
        newMember.name,
        undefined, // photo_url
        relationships,
        {} // custom_fields
      );

      // Refresh family details to get updated members list
      await fetchFamilyDetails();

      setNewMember({ name: '', email: '', relationship: '' });
      setShowAddMember(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    if (!user?.family_id) {
      setError('No family ID found');
      return;
    }

    try {
      await deleteFamilyMember(user.family_id, memberId);
      // Refresh family details to get updated members list
      await fetchFamilyDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'family_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Landing Page Style */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground">Family Hub</h1>
              <p className="text-lg text-muted-foreground">Manage your family members and information</p>
            </div>
            {/* <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              Logout
            </button> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-destructive/10 border border-destructive/30 rounded-2xl">
            <p className="text-destructive font-medium text-lg">{error}</p>
          </div>
        )}

        {/* Approval Status Banner */}
        <div className="mb-8 p-6 bg-white/5 border border-border rounded-2xl">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-semibold text-foreground text-lg">Account Approved</h3>
              <p className="text-muted-foreground mt-1">Your admin account is active and ready to use</p>
            </div>
          </div>
        </div>

        {/* Family Info Cards */}
        {familyDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Family Name Card */}
            <Link
              href={`/families/${familyDetails.id}`}
              className="group bg-white/5 border border-border rounded-2xl p-8 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl cursor-pointer"
            >
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Family Name</p>
              <p className="text-3xl font-bold text-foreground mt-3">{familyDetails.name}</p>
              <p className="text-xs text-muted-foreground mt-3">Created {new Date(familyDetails.created_at).toLocaleDateString()}</p>
            </Link>

            {/* Admin Info Card */}
            <div className="group bg-white/5 border border-border rounded-2xl p-8 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Admin Info</p>
              <p className="text-xl font-bold text-foreground mt-3">{familyDetails.admin_name}</p>
              <p className="text-xs text-muted-foreground mt-3 truncate">{familyDetails.admin_email}</p>
            </div>

            {/* Members Card */}
            <div className="group bg-white/5 border border-border rounded-2xl p-8 hover:border-border/80 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Members</p>
              <p className="text-3xl font-bold text-foreground mt-3">{familyDetails.member_count}</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddMember(true)}
                  className="text-sm px-4 py-2 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                >
                  + Add
                </button>
                <Link
                  href={`/families/${familyDetails.id}/members/bulk-import`}
                  className="text-sm px-4 py-2 bg-[#262626] text-white font-semibold rounded-lg border border-[#262626] hover:border-white hover:bg-transparent transition-all duration-300 hover:scale-105"
                >
                  Bulk Import
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Members Section */}
        <div className="bg-background rounded-2xl border border-border overflow-hidden">
          <div className="px-8 py-6 border-b border-border bg-white/2 flex justify-between items-center gap-3 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Family Members</h2>
              <p className="text-muted-foreground mt-1">Manage your family members</p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/families/${familyDetails?.id}/members/bulk-import`}
                className="px-6 py-3 bg-[#262626] text-white font-semibold rounded-lg border border-[#262626] hover:border-white hover:bg-transparent transition-all duration-300 hover:scale-105"
              >
                📥 Bulk Import
              </Link>
              <button
                onClick={() => setShowAddMember(true)}
                className="px-6 py-3 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105"
              >
                + Add Member
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="px-8 py-6">
            {familyDetails?.members && familyDetails.members.length > 0 ? (
              <div className="space-y-4">
                {familyDetails.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-lg">{member.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{member.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-foreground/10 text-foreground px-3 py-1 rounded-full font-medium">
                        {(member.relationships && typeof member.relationships === 'object' && 'relationship' in member.relationships ? member.relationships.relationship : 'member') || 'Member'}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="px-4 py-2 text-sm font-medium text-destructive hover:text-destructive/80 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No members added yet</p>
                <p className="text-muted-foreground text-sm mt-2">Add your first family member to get started</p>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="mt-6 text-foreground font-semibold hover:opacity-70 transition text-sm px-4 py-2 bg-white/10 rounded-lg border border-border"
                >
                  Add First Member
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-2">Add Family Member</h2>
              <p className="text-muted-foreground mb-6">Add a new member to your family</p>

              <form onSubmit={handleAddMember} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background text-foreground placeholder:text-muted-foreground transition"
                    disabled={addMemberLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="john@family.com"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background text-foreground placeholder:text-muted-foreground transition"
                    disabled={addMemberLoading}
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Relationship
                  </label>
                  <select
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background text-foreground transition"
                    disabled={addMemberLoading}
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="uncle">Uncle</option>
                    <option value="aunt">Aunt</option>
                    <option value="cousin">Cousin</option>
                    <option value="in-law">In-law</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    disabled={addMemberLoading}
                    className="flex-1 px-4 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMemberLoading}
                    className="flex-1 px-4 py-3 bg-white text-[#010104] font-semibold rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {addMemberLoading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
