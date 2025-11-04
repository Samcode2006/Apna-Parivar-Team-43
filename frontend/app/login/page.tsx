'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      

        {/* Login Options Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Family Admin Login Card */}
          <Link
            href="/admin-login"
            className="group flex flex-col h-full"
          >
            <div className="flex-1 p-8 bg-primary/5 rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Admin Login</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Access your family dashboard and manage members, settings, and family information
              </p>
              <div className="flex items-center text-card-foreground font-semibold group-hover:opacity-80 transition">
                <span>Login</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Family Admin Signup Card */}
          <Link
            href="/admin-signup"
            className="group flex flex-col h-full"
          >
            <div className="flex-1 p-8 bg-primary/5 rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Create Family Admin</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Register your family and become an admin. Create a new family tree and invite members
              </p>
              <div className="flex items-center text-card-foreground font-semibold group-hover:opacity-80 transition">
                <span>Register</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Family Member Login Card */}
          <Link
            href="/member-login"
            className="group flex flex-col h-full"
          >
            <div className="flex-1 p-8 bg-primary/5 rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M9 9H5m14 0h-4m6 7a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Family Member Login</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Login with your family credentials to view and explore your family tree
              </p>
              <div className="flex items-center text-card-foreground font-semibold group-hover:opacity-80 transition">
                <span>Login</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-8">
            <h3 className="text-lg font-bold text-card-foreground mb-3">For Family Admins</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Create and manage your family tree</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Invite and manage family members</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>View analytics and family statistics</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-8">
            <h3 className="text-lg font-bold text-card-foreground mb-3">For Family Members</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Browse your family relationships</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>View shared family information</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Stay connected with relatives</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground mb-2">Need help or have questions?</p>
          <Link href="/" className="text-primary hover:opacity-80 font-medium transition">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
