'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context-new';
import Link from 'next/link';

export default function AdminSignupPage() {
  const router = useRouter();
  const { adminRegister, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    family_name: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.full_name || !formData.family_name || !formData.password || !formData.confirm_password) {
      setError('All fields are required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.family_name)) {
      setError('Family name can only contain letters, numbers, underscores, and hyphens');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      const response = await adminRegister(
        formData.email,
        formData.full_name,
        formData.family_name,
        formData.password,
        formData.confirm_password
      );
      setSuccess(true);
      setRequestId(response.request_id);
      setFamilyPassword(response.family_password || '');
      setFormData({
        email: '',
        full_name: '',
        family_name: '',
        password: '',
        confirm_password: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card dark:bg-[#000000] rounded-lg shadow-xl dark:shadow-2xl dark:shadow-white/5 overflow-hidden dark:border dark:border-gray-800">
            {/* Success Header */}
            <div className="bg-primary px-6 py-8">
              <h1 className="text-2xl font-bold text-primary-foreground">✓ Registration Submitted</h1>
              <p className="text-primary-foreground/80 mt-2">Your admin request is awaiting approval</p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-primary text-sm">
                  <strong>Great!</strong> Your admin onboarding request has been submitted successfully. A SuperAdmin will review your request shortly.
                </p>
              </div>

              {/* Request ID */}
              <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">Request ID (Save this)</p>
                <p className="text-lg font-mono text-primary break-all">{requestId}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(requestId);
                    alert('Request ID copied!');
                  }}
                  className="mt-2 text-xs text-primary hover:opacity-70 font-semibold underline"
                >
                  Copy to clipboard
                </button>
              </div>

              {/* Family Password */}
              <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-1">Family Password (Save this!)</p>
                <p className="text-lg font-mono text-accent break-all">{familyPassword}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(familyPassword);
                    alert('Family password copied!');
                  }}
                  className="mt-2 text-xs text-accent hover:opacity-70 font-semibold underline"
                >
                  Copy to clipboard
                </button>
                <p className="text-xs text-accent/80 mt-3">
                  <strong>⚠️ Important:</strong> Share this password with your family members to let them access the family tree.
                </p>
              </div>

              {/* Next Steps */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-card-foreground">Next Steps:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Check your email for approval notification</li>
                  <li>Once approved, you can login with your email and password</li>
                  <li>Share the family name and family password with family members</li>
                  <li>Family members can then login and view the family tree</li>
                </ol>
              </div>

              {/* Status Checker */}
              <Link
                href={`/admin-signup/status/${requestId}`}
                className="block w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition text-center mb-3"
              >
                Check Status
              </Link>

              {/* Back to Home */}
              <Link
                href="/"
                className="block w-full bg-secondary text-secondary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card dark:bg-[#000000] rounded-lg shadow-xl dark:shadow-2xl dark:shadow-white/5 overflow-hidden dark:border dark:border-gray-800">
          {/* Header */}
          <div className="bg-primary px-6 py-8">
            <h1 className="text-3xl font-bold text-primary-foreground">Family Admin</h1>
            <p className="text-primary-foreground/80 mt-2">Register your family</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@family.com"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                  disabled={isLoading}
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-card-foreground mb-1">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                  disabled={isLoading}
                />
              </div>

              {/* Family Name */}
              <div>
                <label htmlFor="family_name" className="block text-sm font-medium text-card-foreground mb-1">
                  Unique Family Name
                </label>
                <input
                  id="family_name"
                  type="text"
                  name="family_name"
                  value={formData.family_name}
                  onChange={handleChange}
                  placeholder="john_family"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">Letters, numbers, underscores, and hyphens only</p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-card-foreground mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition bg-background text-foreground"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Registering...
                  </span>
                ) : (
                  'Register as Admin'
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary space-y-1">
              <p>
                <strong>💡 After registration:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your request will be pending SuperAdmin approval</li>
                <li>You'll receive your family password automatically</li>
                <li>Once approved, you can login and manage your family</li>
              </ul>
            </div>
          </div>

          {/* Footer Links */}
          <div className="bg-card dark:bg-[#000000] px-8 py-4 border-t border-border/50 dark:border-border/30 rounded-b-lg">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/admin-login" className="text-primary hover:opacity-70 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
