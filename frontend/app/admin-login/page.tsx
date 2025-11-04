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
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, user, router]);

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
      router.push('/admin/dashboard');
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card dark:bg-[#000000] rounded-lg shadow-xl dark:shadow-2xl overflow-hidden dark:border dark:border-gray-800">
          {/* Header */}
          <div className="bg-primary px-6 py-8">
            <h1 className="text-3xl font-bold text-primary-foreground">Family Admin</h1>
            <p className="text-primary-foreground/80 mt-2">Login to your account</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Info Message */}
            {message && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm text-primary">{message}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@family.com"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
                    disabled={loading}
                  >
                    <span className="inline-block">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="bg-card dark:bg-[#000000] px-8 py-4 border-t border-border dark:border-gray-800 rounded-b-lg shadow-lg dark:shadow-black/20">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/admin-signup" className="text-primary hover:opacity-70 font-medium">
                Register here
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              <Link href="/" className="text-primary hover:opacity-70 font-medium">
                Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

