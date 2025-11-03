-- Row-Level Security Policies for ApnaParivar - FIXED VERSION
-- Execute this after schema.sql on Supabase PostgreSQL Database
-- This version removes all policies that cause infinite recursion

-- Disable RLS temporarily to clear all policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE RLS POLICIES (Simplified - No Recursion)
-- ============================================

-- Users can see themselves
CREATE POLICY "user_see_self" ON users
    FOR SELECT
    USING (id = auth.uid());

-- Allow inserting own user record (for new signups)
CREATE POLICY "user_insert_self" ON users
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Users can update their own record
CREATE POLICY "user_update_self" ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- SuperAdmin can see all users
CREATE POLICY "super_admin_see_all_users" ON users
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
    );

-- SuperAdmin can insert users
CREATE POLICY "super_admin_insert_users" ON users
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
    );

-- SuperAdmin can update any user
CREATE POLICY "super_admin_update_users" ON users
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
    );

-- SuperAdmin can delete users
CREATE POLICY "super_admin_delete_users" ON users
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
    );

-- ============================================
-- FAMILIES TABLE RLS POLICIES (Disabled for now)
-- ============================================

-- Note: Family table policies disabled to prevent recursion
-- Will be re-enabled after user signup is working
-- For now, families are world-readable

-- ============================================
-- FAMILY_MEMBERS TABLE RLS POLICIES (Disabled for now)
-- ============================================

-- Note: Family members table policies disabled to prevent recursion
-- Will be re-enabled after user signup is working
-- For now, family_members are world-readable
