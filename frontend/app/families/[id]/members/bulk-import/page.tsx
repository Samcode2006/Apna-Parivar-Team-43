'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import { bulkCreateFamilyMembers } from '@/lib/family-service';
import { FamilyMember } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const PREDEFINED_CUSTOM_FIELDS = [
  'Date of Birth',
  'Phone Number',
  'Occupation',
  'Education',
  'Blood Group',
  'Address',
  'City',
  'Country',
  'Notes'
];

interface BulkMemberRow {
  id: string;
  name: string;
  photoUrl?: string;
  relationships: Record<string, string>;
  customFields: Record<string, string>;
}

export default function BulkImportPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = params.id as string;
  const { user } = useAuth();

  const [importMethod, setImportMethod] = useState<'form' | 'csv'>('form');
  const [members, setMembers] = useState<BulkMemberRow[]>([
    {
      id: '1',
      name: '',
      photoUrl: '',
      relationships: { father: '', mother: '', spouse: '' },
      customFields: Object.fromEntries(PREDEFINED_CUSTOM_FIELDS.map(field => [field, '']))
    }
  ]);

  const [csvContent, setCsvContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add a new empty member row
  const addMemberRow = () => {
    const newMember: BulkMemberRow = {
      id: String(members.length + 1),
      name: '',
      photoUrl: '',
      relationships: { father: '', mother: '', spouse: '' },
      customFields: Object.fromEntries(PREDEFINED_CUSTOM_FIELDS.map(field => [field, '']))
    };
    setMembers([...members, newMember]);
  };

  // Remove a member row
  const removeMemberRow = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  // Update member field
  const updateMember = (id: string, field: keyof BulkMemberRow, value: any) => {
    setMembers(members.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  // Update member custom field
  const updateCustomField = (id: string, fieldName: string, value: string) => {
    setMembers(members.map(m =>
      m.id === id
        ? { ...m, customFields: { ...m.customFields, [fieldName]: value } }
        : m
    ));
  };

  // Update relationship
  const updateRelationship = (id: string, relType: string, value: string) => {
    setMembers(members.map(m =>
      m.id === id
        ? { ...m, relationships: { ...m.relationships, [relType]: value } }
        : m
    ));
  };

  // Parse CSV content
  const parseCSV = (content: string) => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const newMembers: BulkMemberRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === 0 || values.every(v => !v)) continue;

      const memberObj: BulkMemberRow = {
        id: String(newMembers.length + 1),
        name: '',
        photoUrl: '',
        relationships: { father: '', mother: '', spouse: '' },
        customFields: Object.fromEntries(PREDEFINED_CUSTOM_FIELDS.map(field => [field, '']))
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        if (header === 'Name') {
          memberObj.name = value;
        } else if (header === 'Photo URL') {
          memberObj.photoUrl = value;
        } else if (header.startsWith('Relationship:')) {
          const relType = header.split(':')[1].trim();
          memberObj.relationships[relType] = value;
        } else if (header === 'Email Address' || header === 'Email') {
          // Store email in relationships for authentication
          memberObj.relationships['email'] = value;
        } else if (PREDEFINED_CUSTOM_FIELDS.includes(header)) {
          memberObj.customFields[header] = value;
        }
      });

      if (memberObj.name) {
        newMembers.push(memberObj);
      }
    }

    if (newMembers.length === 0) {
      throw new Error('No valid members found in CSV');
    }

    return newMembers;
  };

  // Handle CSV upload
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setCsvContent(content);
        const parsedMembers = parseCSV(content);
        setMembers(parsedMembers);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  };

  // Handle CSV paste
  const handleCSVPaste = () => {
    try {
      const parsedMembers = parseCSV(csvContent);
      setMembers(parsedMembers);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV');
    }
  };

  // Submit bulk creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validMembers = members.filter(m => m.name && m.name.trim());
    if (validMembers.length === 0) {
      setError('Please add at least one member with a name');
      return;
    }

    // Check for empty names
    const emptyNameMembers = members.filter(m => !m.name || !m.name.trim());
    if (emptyNameMembers.length > 0) {
      setError('All members must have a name. Please fill in missing names.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Convert to format expected by API
      const membersData = members.map(m => ({
        name: m.name,
        photo_url: m.photoUrl || null,
        relationships: Object.fromEntries(
          Object.entries(m.relationships).filter(([_, v]) => v)
        ),
        custom_fields: Object.fromEntries(
          Object.entries(m.customFields).filter(([_, v]) => v)
        )
      }));

      const result = await bulkCreateFamilyMembers(familyId, membersData as any);
      
      setSuccess(`Successfully created ${result.created_count} family members!`);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/families/${familyId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create members');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'Name',
      'Photo URL',
      'Relationship: father',
      'Relationship: mother',
      'Relationship: spouse',
      'Relationship: email',
      ...PREDEFINED_CUSTOM_FIELDS
    ];
    
    const csvContent = [
      headers.join(','),
      Array(headers.length).fill('').join(',') // Empty row as template
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-members-template.csv';
    a.click();
  };

  return (
    <ProtectedRoute requiredRole={['family_admin', 'family_co_admin']}>
      <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/families/${familyId}`} 
              className="text-white/60 hover:text-white mb-4 inline-flex items-center gap-2 transition"
            >
              Back to Family
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Bulk Add Members</h1>
            <p className="text-muted-foreground mt-2">Add 20-30+ family members in just a few minutes</p>
          </div>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5 p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400">{success}</p>
              </div>
            )}

            {/* Method Selection */}
            <div className="mb-8 flex gap-4">
              <button
                onClick={() => setImportMethod('form')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  importMethod === 'form'
                    ? 'bg-white text-[#010104]'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                Form Entry
              </button>
              <button
                onClick={() => setImportMethod('csv')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  importMethod === 'csv'
                    ? 'bg-white text-[#010104]'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                CSV Import
              </button>
            </div>

            {/* CSV Import Method */}
            {importMethod === 'csv' && (
              <div className="mb-8 space-y-4 border-b border-white/10 pb-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Import from CSV</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Upload CSV File
                      </label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground file:text-foreground file:bg-white/20 file:border-0 file:px-3 file:py-1.5 file:rounded file:cursor-pointer hover:border-white/40 transition-all"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={downloadTemplate}
                        className="px-4 py-2.5 bg-white/10 border border-white/20 text-foreground rounded-lg hover:bg-white/20 transition-all text-sm font-medium"
                      >
                        Download Template
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Or Paste CSV Content
                      </label>
                      <textarea
                        value={csvContent}
                        onChange={(e) => setCsvContent(e.target.value)}
                        placeholder="Name,Photo URL,Relationship: father,Relationship: mother,Date of Birth,Phone Number,..."
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all min-h-[150px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCSVPaste}
                      className="px-4 py-2.5 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm font-medium"
                    >
                      Parse CSV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Entry Method */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Name *</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Photo URL</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Father</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Mother</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 text-xs"
                            required
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="url"
                            value={member.photoUrl || ''}
                            onChange={(e) => updateMember(member.id, 'photoUrl', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 text-xs"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={member.relationships.father || ''}
                            onChange={(e) => updateRelationship(member.id, 'father', e.target.value)}
                            placeholder="Father's name"
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 text-xs"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={member.relationships.mother || ''}
                            onChange={(e) => updateRelationship(member.id, 'mother', e.target.value)}
                            placeholder="Mother's name"
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 text-xs"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="email"
                            value={member.relationships.email || ''}
                            onChange={(e) => updateRelationship(member.id, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 text-xs"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          {members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMemberRow(member.id)}
                              className="px-2 py-1 bg-red-500/20 border border-red-500/40 text-red-400 rounded hover:bg-red-500/30 transition text-xs font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Custom Fields Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Custom Fields (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You can add up to 10 predefined custom fields for each member. Scroll down to see more options.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 font-semibold text-foreground min-w-[200px]">Name</th>
                        {PREDEFINED_CUSTOM_FIELDS.map((field) => (
                          <th key={field} className="text-left py-3 px-4 font-semibold text-foreground min-w-[120px]">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={`custom-${member.id}`} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-3 px-4 font-medium text-foreground">{member.name || 'New Member'}</td>
                          {PREDEFINED_CUSTOM_FIELDS.map((field) => (
                            <td key={`${member.id}-${field}`} className="py-3 px-4">
                              <input
                                type="text"
                                value={member.customFields[field] || ''}
                                onChange={(e) => updateCustomField(member.id, field, e.target.value)}
                                placeholder={field}
                                className="w-full px-2 py-1.5 bg-white/5 border border-white/20 rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 text-xs"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Member Button */}
              <button
                type="button"
                onClick={addMemberRow}
                className="text-white/60 hover:text-white text-sm font-medium transition"
              >
                + Add Another Member
              </button>

              {/* Submit Section */}
              <div className="flex gap-3 pt-6 border-t border-white/10 flex-col sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? `Adding ${members.length} Members...` : `Add ${members.length} Members`}
                </button>
                <Link
                  href={`/families/${familyId}`}
                  className="px-6 py-2.5 bg-white/10 border border-white/20 text-foreground text-center font-medium rounded-lg hover:border-white/40 transition-all"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-white/5 border border-white/20 rounded-xl">
            <h3 className="text-lg font-semibold text-foreground mb-3">💡 Tips for Bulk Import</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>✓ Add up to 100 members in a single batch</li>
              <li>✓ All 10 custom fields are predefined for consistency</li>
              <li>✓ CSV format: Name, Photo URL, Relationships, and Custom Fields</li>
              <li>✓ Download the template CSV to get the correct format</li>
              <li>✓ Leave fields blank if not applicable</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
