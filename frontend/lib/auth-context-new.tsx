'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthResponse, AdminOnboardingResponse } from './types';
import * as authService from './auth-service-new';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: 'super_admin' | 'family_admin' | 'family_user' | null;

  // SuperAdmin methods
  superAdminLogin: (username: string, password: string) => Promise<void>;

  // Family Admin methods
  adminRegister: (
    email: string,
    fullName: string,
    familyName: string,
    password: string,
    confirmPassword: string,
    familyPassword: string
  ) => Promise<AdminOnboardingResponse>;
  adminLogin: (email: string, password: string) => Promise<void>;
  checkAdminStatus: (requestId: string) => Promise<AdminOnboardingResponse>;

  // Family Member methods
  familyMemberLogin: (email: string, familyName: string, familyPassword: string) => Promise<void>;

  // SuperAdmin management methods
  getPendingRequests: () => Promise<any>;
  approveAdminRequest: (requestId: string, adminPassword: string) => Promise<void>;
  rejectAdminRequest: (requestId: string, rejectionReason: string) => Promise<void>;

  // Common methods
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleSuperAdminLogin = async (username: string, password: string) => {
    try {
      const response = await authService.superAdminLogin(username, password);
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const handleAdminRegister = async (
    email: string,
    fullName: string,
    familyName: string,
    password: string,
    confirmPassword: string,
    familyPassword: string
  ): Promise<AdminOnboardingResponse> => {
    try {
      return await authService.adminRegister({
        email,
        full_name: fullName,
        family_name: familyName,
        password,
        confirm_password: confirmPassword,
        family_password: familyPassword,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      const response = await authService.adminLogin(email, password);
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const handleCheckAdminStatus = async (requestId: string): Promise<AdminOnboardingResponse> => {
    try {
      return await authService.checkAdminStatus(requestId);
    } catch (error) {
      throw error;
    }
  };

  const handleFamilyMemberLogin = async (
    email: string,
    familyName: string,
    familyPassword: string
  ) => {
    try {
      const response = await authService.familyMemberLogin({
        email,
        family_name: familyName,
        family_password: familyPassword,
      });
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const handleGetPendingRequests = async () => {
    try {
      return await authService.getPendingRequests();
    } catch (error) {
      throw error;
    }
  };

  const handleApproveAdminRequest = async (requestId: string, adminPassword: string) => {
    try {
      await authService.approveAdminRequest(requestId, adminPassword);
    } catch (error) {
      throw error;
    }
  };

  const handleRejectAdminRequest = async (requestId: string, rejectionReason: string) => {
    try {
      await authService.rejectAdminRequest(requestId, rejectionReason);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const refetchUser = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Failed to refetch user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    userRole: (user?.role as 'super_admin' | 'family_admin' | 'family_user' | null) || null,
    superAdminLogin: handleSuperAdminLogin,
    adminRegister: handleAdminRegister,
    adminLogin: handleAdminLogin,
    checkAdminStatus: handleCheckAdminStatus,
    familyMemberLogin: handleFamilyMemberLogin,
    getPendingRequests: handleGetPendingRequests,
    approveAdminRequest: handleApproveAdminRequest,
    rejectAdminRequest: handleRejectAdminRequest,
    logout: handleLogout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
