'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import Link from 'next/link';

export default function MemberLoginPage() {
  const router = useRouter();
  const { familyMemberLogin, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated as family_user, redirect to families
  useEffect(() => {
    if (isAuthenticated && user?.role === 'family_user') {
      router.replace('/families');
    }
  }, [isAuthenticated, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!familyName.trim()) {
      setError('Please enter your family name');
      return;
    }
    if (!familyPassword) {
      setError('Please enter the family password');
      return;
    }

    try {
      setLoading(true);
      await familyMemberLogin(email, familyName, familyPassword);
      router.replace('/families');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2"></h1>
          <h2 className="text-3xl font-bold text-foreground">Apna Parivar</h2>
          <p className="text-muted-foreground mt-2">Family Member Login</p>
        </div>

        {/* Login Card */}
                {/* Login Card */}
        <div className="bg-primary/5 rounded-2xl shadow-2xl p-8 border-primary/10">
          {/* Welcome Message */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-card-foreground">Welcome, Family!</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Login to view your family tree and connections
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-primary">
              <strong>💡 Tip:</strong> Your family admin will provide you with the family name and password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-card-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@family.com"
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                disabled={loading}
              />
            </div>

            {/* Family Name Field */}
            <div>
              <label htmlFor="familyName" className="block text-sm font-semibold text-card-foreground mb-2">
                Family Name
              </label>
              <input
                type="text"
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="your_family_name"
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                disabled={loading}
              />
            </div>

            {/* Family Password Field */}
            <div>
              <label htmlFor="familyPassword" className="block text-sm font-semibold text-card-foreground mb-2">
                Family Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="familyPassword"
                  value={familyPassword}
                  onChange={(e) => setFamilyPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-2 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Help Text */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              👨‍💼 Are you a family admin?{' '}
              <Link href="/admin-login" className="text-foreground font-semibold hover:opacity-70">
                Login here
              </Link>
            </p>
            <p>
              ❓ Don't have credentials?{' '}
              <Link href="/" className="text-foreground font-semibold hover:opacity-70">
                Contact your admin
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/" className="text-foreground hover:text-[#666666] font-medium text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
