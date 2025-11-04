'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminLogin, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Get message from query params (e.g., from approval page)
  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) {
      setMessage(decodeURIComponent(msg));
    }
  }, [searchParams]);

  // If already authenticated as family_admin, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'family_admin') {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      await adminLogin(email, password);
      // Use replace to avoid keeping login page in history
      router.replace('/admin/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);

      // Check if error indicates pending approval
      if (errorMsg.includes('pending') || errorMsg.includes('not approved')) {
        setMessage('Your account is still awaiting SuperAdmin approval. Please check back later.');
      }
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
          <p className="text-muted-foreground mt-2">Family Admin Login</p>
        </div>

        {/* Info Message */}
        {message && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-sm text-primary">{message}</p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-card bg-primary/5 rounded-2xl shadow-2xl p-8 border-primary/10">
          {/* Welcome Message */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-card-foreground">Welcome Back</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Login to manage your family and members
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

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
                placeholder="admin@family.com"
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-card-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

          {/* Additional Info */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              📝 Don't have an account?{' '}
              <Link href="/admin-signup" className="text-foreground font-semibold hover:opacity-70">
                Register here
              </Link>
            </p>
            <p>
              ⏳ Waiting for approval?{' '}
              <Link href="/admin-signup/status" className="text-foreground font-semibold hover:opacity-70">
                Check status
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/" className="text-foreground hover:opacity-70 font-medium text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
