// Type definitions for the frontend

export type UserRole = 'super_admin' | 'family_admin' | 'family_co_admin' | 'family_user';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  family_id: string | null;
  approval_status?: ApprovalStatus;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  family_name: string;
  admin_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  email: ReactNode;
  id: string;
  family_id: string;
  name: string;
  photo_url: string | null;
  relationships: Record<string, string>;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: UserProfile;
  message?: string;
}

export interface AdminOnboardingRequest {
  id?: string;
  email: string;
  full_name: string;
  family_name: string;
  password: string;
  confirm_password: string;
  family_password: string;
}

export interface AdminOnboardingResponse {
  request_id: string;
  status: ApprovalStatus;
  message?: string;
  family_password?: string;
  rejection_reason?: string;
  email?: string;
  family_name?: string;
  requested_at?: string;
  reviewed_at?: string;
}

export interface PendingAdminRequest {
  id: string;
  email: string;
  full_name: string;
  family_name: string;
  status: ApprovalStatus;
  requested_at: string;
}

export interface PendingRequestsResponse {
  total: number;
  requests: PendingAdminRequest[];
}

export interface AdminApprovalRequest {
  request_id: string;
  action: 'approve' | 'reject';
  admin_password?: string;
  rejection_reason?: string;
}

export interface FamilyMemberLoginRequest {
  email: string;
  family_name: string;
  family_password: string;
}

