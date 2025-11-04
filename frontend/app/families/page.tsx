'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import { getAllFamilies } from '@/lib/family-service';
import { Family } from '@/lib/types';
import Link from 'next/link';

export default function FamiliesPage() {
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setIsLoading(true);
      const data = await getAllFamilies();
      setFamilies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load families');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <ProtectedRoute requiredRole={['family_admin', 'family_user']}>
      <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 flex justify-between items-start flex-col sm:flex-row gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Families</h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Your family
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Families List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
            </div>
          ) : families.length === 0 ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <p className="text-muted-foreground text-lg">No families yet. Create your first family!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family) => (
                <div key={family.id} className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:border-white/40 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-white transition-colors">{family.family_name}</h3>
                  <p className="text-xs text-muted-foreground mt-2">ID: {family.id}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(family.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/families/${family.id}`}
                      className="block w-full px-3 py-2 bg-white text-[#010104] text-center font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 transition-all duration-300 text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
