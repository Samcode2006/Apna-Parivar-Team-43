"""
Service for managing admin onboarding requests
Handles creation, approval, and rejection of family admin requests
"""

from typing import Optional, List
from supabase import Client
from datetime import datetime
from core.encryption import EncryptionService, PasswordHashingService
import uuid


class AdminOnboardingService:
    """Service for managing admin onboarding workflow"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def create_onboarding_request(
        self,
        email: str,
        full_name: str,
        family_name: str,
        admin_password: str
    ) -> dict:
        """
        Create a new admin onboarding request waiting for SuperAdmin approval
        
        Args:
            email: Admin's email
            full_name: Admin's full name
            family_name: Unique family name
            admin_password: Admin's password (used to encrypt family password)
        
        Returns:
            Created request data
        """
        try:
            # Check if family_name already exists
            family_check = self.supabase.table("families").select("*").eq("family_name", family_name).execute()
            if family_check.data:
                raise ValueError("Family name already exists")
            
            # Check if email is already requested or registered
            email_check = self.supabase.table("admin_onboarding_requests").select("*").eq("email", email).eq("status", "pending").execute()
            if email_check.data:
                raise ValueError("Request already exists for this email")
            
            user_check = self.supabase.table("users").select("*").eq("email", email).execute()
            if user_check.data:
                raise ValueError("Email already registered")
            
            # Generate a unique family password for the family (not the admin password)
            family_password = str(uuid.uuid4())[:8]  # Short, memorable password
            
            # Encrypt family password using admin password as key
            encrypted_family_password = EncryptionService.encrypt(family_password, admin_password)
            
            # Create the request
            request_data = {
                "email": email,
                "full_name": full_name,
                "family_name": family_name,
                "family_password_encrypted": encrypted_family_password,
                "status": "pending"
            }
            
            response = self.supabase.table("admin_onboarding_requests").insert(request_data).execute()
            
            if response.data:
                return {
                    "request_id": response.data[0].get("id"),
                    "status": "pending",
                    "message": "Admin onboarding request created. Awaiting SuperAdmin approval.",
                    "family_password": family_password  # Return this so admin can save it
                }
            else:
                raise Exception("Failed to create request")
        
        except Exception as e:
            raise Exception(f"Error creating onboarding request: {str(e)}")
    
    async def get_pending_requests(self) -> List[dict]:
        """
        Get all pending admin onboarding requests
        
        Returns:
            List of pending requests
        """
        try:
            response = self.supabase.table("admin_onboarding_requests").select("*").eq("status", "pending").order("requested_at", desc=True).execute()
            
            # Remove sensitive fields like encrypted passwords before returning
            requests = []
            for req in response.data or []:
                safe_req = {
                    "id": req.get("id"),
                    "email": req.get("email"),
                    "full_name": req.get("full_name"),
                    "family_name": req.get("family_name"),
                    "status": req.get("status"),
                    "requested_at": req.get("requested_at")
                }
                requests.append(safe_req)
            
            return requests
        
        except Exception as e:
            raise Exception(f"Error fetching pending requests: {str(e)}")
    
    async def get_request_by_id(self, request_id: str) -> Optional[dict]:
        """
        Get a specific onboarding request by ID
        
        Args:
            request_id: The request ID
        
        Returns:
            Request data or None
        """
        try:
            response = self.supabase.table("admin_onboarding_requests").select("*").eq("id", request_id).execute()
            return response.data[0] if response.data else None
        
        except Exception as e:
            raise Exception(f"Error fetching request: {str(e)}")
    
    async def approve_request(
        self,
        request_id: str,
        superadmin_user_id: str,
        admin_password: str
    ) -> dict:
        """
        Approve an admin onboarding request
        Creates user and family accounts
        
        Args:
            request_id: The request ID to approve
            superadmin_user_id: The SuperAdmin user ID approving the request
            admin_password: Admin password (needed to verify they can create their account)
        
        Returns:
            Success response with user and family data
        """
        try:
            # Get the request
            request = await self.get_request_by_id(request_id)
            if not request:
                raise ValueError("Request not found")
            
            if request.get("status") != "pending":
                raise ValueError(f"Request is not pending (status: {request.get('status')})")
            
            email = request.get("email")
            full_name = request.get("full_name")
            family_name = request.get("family_name")
            encrypted_family_password = request.get("family_password_encrypted")
            
            # Hash the admin password for our own record (optional if using Supabase Auth)
            password_hash = PasswordHashingService.hash_password(admin_password)

            # Create the Supabase Auth user (requires service role key)
            # If the user already exists in auth, reuse that id
            try:
                created = self.supabase.auth.admin.create_user({
                    "email": email,
                    "password": admin_password,
                    "email_confirm": True,
                })
                user_id = created.user.id
            except Exception:
                # Fallback: try to find existing auth user by email
                # Note: list_users may be paginated; here we rely on query filter support
                listed = self.supabase.auth.admin.list_users(email=email)
                auth_user = None
                if hasattr(listed, "data") and listed.data and hasattr(listed.data, "users"):
                    for u in listed.data.users:
                        if getattr(u, "email", None) == email:
                            auth_user = u
                            break
                # Some client versions return .users directly
                if auth_user is None and hasattr(listed, "users") and listed.users:
                    for u in listed.users:
                        if getattr(u, "email", None) == email:
                            auth_user = u
                            break
                if auth_user is None:
                    raise
                user_id = auth_user.id

            # Create family record
            family_id = str(uuid.uuid4())
            family_data = {
                "id": family_id,
                "family_name": family_name,
                "admin_user_id": user_id,
                "family_password_encrypted": encrypted_family_password
            }
            
            family_response = self.supabase.table("families").insert(family_data).execute()
            
            if not family_response.data:
                raise Exception("Failed to create family")
            
            # Create user record in users table
            user_data = {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "family_id": family_id,
                "role": "family_admin",
                "approval_status": "approved",
                "password_hash": password_hash
            }
            
            user_response = self.supabase.table("users").insert(user_data).execute()
            
            if not user_response.data:
                raise Exception("Failed to create user")
            
            # Update the request status to approved
            update_data = {
                "status": "approved",
                "user_id": user_id,
                "reviewed_by": superadmin_user_id,
                "reviewed_at": datetime.utcnow().isoformat()
            }
            
            self.supabase.table("admin_onboarding_requests").update(update_data).eq("id", request_id).execute()
            
            return {
                "message": "Admin request approved successfully",
                "status": "approved",
                "user_id": user_id,
                "family_id": family_id,
                "email": email,
                "family_name": family_name
            }
        
        except Exception as e:
            raise Exception(f"Error approving request: {str(e)}")
    
    async def reject_request(
        self,
        request_id: str,
        superadmin_user_id: str,
        rejection_reason: str
    ) -> dict:
        """
        Reject an admin onboarding request
        
        Args:
            request_id: The request ID to reject
            superadmin_user_id: The SuperAdmin user ID rejecting the request
            rejection_reason: Reason for rejection
        
        Returns:
            Success response
        """
        try:
            # Get the request
            request = await self.get_request_by_id(request_id)
            if not request:
                raise ValueError("Request not found")
            
            if request.get("status") != "pending":
                raise ValueError(f"Request is not pending (status: {request.get('status')})")
            
            # Update the request status to rejected
            update_data = {
                "status": "rejected",
                "rejection_reason": rejection_reason,
                "reviewed_by": superadmin_user_id,
                "reviewed_at": datetime.utcnow().isoformat()
            }
            
            self.supabase.table("admin_onboarding_requests").update(update_data).eq("id", request_id).execute()
            
            return {
                "message": "Admin request rejected",
                "status": "rejected",
                "rejection_reason": rejection_reason
            }
        
        except Exception as e:
            raise Exception(f"Error rejecting request: {str(e)}")
    
    async def get_request_status(self, request_id: str) -> dict:
        """
        Get the current status of a request
        
        Args:
            request_id: The request ID
        
        Returns:
            Status information
        """
        try:
            request = await self.get_request_by_id(request_id)
            if not request:
                raise ValueError("Request not found")
            
            return {
                "request_id": request_id,
                "status": request.get("status"),
                "email": request.get("email"),
                "family_name": request.get("family_name"),
                "requested_at": request.get("requested_at"),
                "reviewed_at": request.get("reviewed_at"),
                "rejection_reason": request.get("rejection_reason")
            }
        
        except Exception as e:
            raise Exception(f"Error getting request status: {str(e)}")
