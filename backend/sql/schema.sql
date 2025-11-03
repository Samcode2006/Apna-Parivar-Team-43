-- SQL Schema for ApnaParivar - Family Tree Platform
-- This script creates the base tables required for the application
-- Execute this on Supabase PostgreSQL Database

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS admin_onboarding_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- Create families table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_name TEXT NOT NULL UNIQUE,
    admin_user_id UUID NOT NULL,
    family_password_encrypted TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (linked to Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'family_user' CHECK (role IN ('super_admin', 'family_admin', 'family_co_admin', 'family_user')),
    approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('approved', 'pending', 'rejected')),
    full_name TEXT,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_onboarding_requests table
CREATE TABLE admin_onboarding_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    family_name TEXT NOT NULL,
    family_password_encrypted TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create family_members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_url TEXT,
    relationships JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_name ON family_members(name);
CREATE INDEX idx_admin_requests_status ON admin_onboarding_requests(status);
CREATE INDEX idx_admin_requests_email ON admin_onboarding_requests(email);

-- Add comments to tables
COMMENT ON TABLE families IS 'Stores family information with encrypted password for multi-tenant setup';
COMMENT ON TABLE users IS 'Stores user information linked to Supabase auth.users with approval status for admins';
COMMENT ON TABLE admin_onboarding_requests IS 'Stores pending admin onboarding requests waiting for SuperAdmin approval';
COMMENT ON TABLE family_members IS 'Stores individual family member information';

-- Add comments to columns
COMMENT ON COLUMN families.family_password_encrypted IS 'Family password encrypted using admin password as key';
COMMENT ON COLUMN users.role IS 'User role: super_admin (platform owner), family_admin (family owner), family_co_admin (co-owner), family_user (read-only member)';
COMMENT ON COLUMN users.approval_status IS 'Approval status for family_admin: approved (active), pending (awaiting superadmin review), rejected (denied access)';
COMMENT ON COLUMN users.password_hash IS 'Hashed password for family_admin and family_user login (non-OAuth)';
COMMENT ON COLUMN admin_onboarding_requests.family_password_encrypted IS 'Family password encrypted using admin password as key';
COMMENT ON COLUMN family_members.relationships IS 'JSON object storing relationship links like parent_1, parent_2, spouse';
COMMENT ON COLUMN family_members.custom_fields IS 'JSON object storing custom user-defined fields (up to 10 fields per family)';
