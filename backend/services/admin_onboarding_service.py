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
        admin_password: str,
        family_password: str
    ) -> dict:
        """
        Create a new admin onboarding request waiting for SuperAdmin approval
        
        Args:
            email: Admin's email
            full_name: Admin's full name
            family_name: Unique family name
            admin_password: Admin's password (used to encrypt family password)
            family_password: Family password that members will use to login
        
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
            
            # Note: We don't check if email exists in auth or users table here
            # because the user might be trying to register with an existing auth email
            # This will be handled during approval
            
            # Validate family password (minimum requirements)
            if len(family_password) < 4:
                raise ValueError("Family password must be at least 4 characters long")
            
            # Encrypt family password using admin password as key
            encrypted_family_password = EncryptionService.encrypt(family_password, admin_password)
            
            # Also hash the family password for verification during member login
            # This allows us to verify without needing the admin password
            family_password_hash = PasswordHashingService.hash_password(family_password)
            
            # Hash the admin password for storage
            password_hash = PasswordHashingService.hash_password(admin_password)
            
            # Create the Supabase Auth user immediately (not waiting for approval)
            # This way the user exists in auth.users and we can create them in users table
            try:
                created = self.supabase.auth.admin.create_user({
                    "email": email,
                    "password": admin_password,
                    "email_confirm": True,
                })
                user_id = created.user.id
            except Exception as create_error:
                error_str = str(create_error).lower()
                # If email already exists in auth, try to find the user ID
                if "already" in error_str and ("registered" in error_str or "exists" in error_str):
                    # Try to get the auth user by listing and searching
                    try:
                        list_response = self.supabase.auth.admin.list_users()
                        auth_user = None
                        
                        # Handle different response structures
                        users_list = []
                        if hasattr(list_response, "users"):
                            users_list = list_response.users
                        elif hasattr(list_response, "data"):
                            if hasattr(list_response.data, "users"):
                                users_list = list_response.data.users
                            elif isinstance(list_response.data, list):
                                users_list = list_response.data
                        
                        # Search for user by email
                        for u in users_list:
                            user_email = getattr(u, "email", None) or u.get("email") if isinstance(u, dict) else None
                            if user_email == email:
                                auth_user = u
                                break
                        
                        if auth_user:
                            # Extract user ID
                            if hasattr(auth_user, "id"):
                                user_id = auth_user.id
                            elif isinstance(auth_user, dict):
                                user_id = auth_user.get("id")
                            else:
                                raise ValueError(f"Could not extract user ID from auth user object")
                        else:
                            raise ValueError(
                                f"Email {email} is already registered in authentication system, "
                                "but we cannot retrieve the user ID. Please contact support."
                            )
                    except Exception as list_error:
                        raise ValueError(
                            f"Email {email} is already registered. Cannot retrieve user ID: {str(list_error)}"
                        )
                else:
                    raise ValueError(f"Failed to create auth user: {str(create_error)}")
            
            # Create user record in users table with pending status
            # This way the user exists from registration, not just after approval
            user_data = {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "role": "family_admin",
                "approval_status": "pending",
                "password_hash": password_hash,
                "family_id": None  # Will be set after approval
            }
            
            # Check if user already exists (in case of duplicate registration attempt)
            existing_user = self.supabase.table("users").select("*").eq("id", user_id).execute()
            if existing_user.data:
                raise ValueError("User already exists. Please check your approval status or contact support.")
            
            user_response = self.supabase.table("users").insert(user_data).execute()
            
            if not user_response.data:
                raise Exception("Failed to create user record")
            
            # Create the onboarding request
            request_data = {
                "email": email,
                "full_name": full_name,
                "family_name": family_name,
                "family_password_encrypted": encrypted_family_password,
                "family_password_hash": family_password_hash,  # Store hash for verification
                "user_id": user_id,  # Link to the user we just created
                "status": "pending"
            }
            
            response = self.supabase.table("admin_onboarding_requests").insert(request_data).execute()
            
            if response.data:
                return {
                    "request_id": response.data[0].get("id"),
                    "status": "pending",
                    "message": "Admin onboarding request created. Awaiting SuperAdmin approval."
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
    
    async def get_all_requests(self) -> List[dict]:
        """
        Get all admin onboarding requests (pending, approved, rejected)
        
        Returns:
            List of all requests
        """
        try:
            response = self.supabase.table("admin_onboarding_requests").select("*").order("requested_at", desc=True).execute()
            
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
            raise Exception(f"Error fetching all requests: {str(e)}")
    
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
            
            # Get the user_id from the request (it was created during registration)
            user_id = request.get("user_id")
            
            if not user_id:
                raise ValueError("Request is missing user_id. This should have been created during registration.")
            
            # Verify the user exists in our users table (should exist from registration)
            existing_user = self.supabase.table("users").select("*").eq("id", user_id).execute()
            
            if not existing_user.data:
                raise ValueError(f"User with ID {user_id} not found in users table. This should not happen.")
            
            user_data = existing_user.data[0]
            
            # Verify the user is still pending
            if user_data.get("approval_status") != "pending":
                raise ValueError(f"User is not pending (status: {user_data.get('approval_status')})")
            
            # Update the user's password hash in case it changed (optional, but good for consistency)
            password_hash = PasswordHashingService.hash_password(admin_password)

            # Get the hash from the request
            family_password_hash = request.get("family_password_hash")
            
            # Create family record
            family_id = str(uuid.uuid4())
            family_data = {
                "id": family_id,
                "family_name": family_name,
                "admin_user_id": user_id,
                "family_password_encrypted": encrypted_family_password,
                "family_password_hash": family_password_hash  # Store hash for member login verification
            }
            
            family_response = self.supabase.table("families").insert(family_data).execute()
            
            if not family_response.data:
                raise Exception("Failed to create family")
            
            # Update the user record with approved status and family_id
            # User already exists from registration, just update their status
            update_data = {
                "family_id": family_id,
                "role": "family_admin",
                "approval_status": "approved",
                "password_hash": password_hash  # Update password hash in case it changed
            }
            user_response = self.supabase.table("users").update(update_data).eq("id", user_id).execute()
            
            if not user_response.data:
                raise Exception("Failed to update user approval status")
            
            # Create the admin as a family member
            # This ensures the admin is also counted as a member of their family
            admin_member_data = {
                "family_id": family_id,
                "name": full_name,
                "photo_url": None,
                "relationships": {
                    "role": "family_admin",
                    "email": email
                },
                "custom_fields": {"user_id": user_id}
            }
            
            member_response = self.supabase.table("family_members").insert(admin_member_data).execute()
            
            if not member_response.data:
                # Log but don't fail - still allow approval even if member creation fails
                print(f"Warning: Failed to create family member record for admin {email}")
            
            # Update the request status to approved
            # Note: If superadmin_user_id is "superadmin" (not a UUID), set reviewed_by to NULL
            # since superadmin doesn't exist in the users table
            reviewed_by = None if superadmin_user_id == "superadmin" else superadmin_user_id
            
            update_data = {
                "status": "approved",
                "user_id": user_id,
                "reviewed_by": reviewed_by,
                "reviewed_at": datetime.utcnow().isoformat()
            }
            
            request_update_response = self.supabase.table("admin_onboarding_requests").update(update_data).eq("id", request_id).execute()

            # Ensure the request record was actually updated. If not, raise so callers can handle it
            if not request_update_response.data:
                raise Exception("Failed to update onboarding request status to approved")
            
            return {
                "message": "Admin request approved successfully",
                "status": "approved",
                "user_id": user_id,
                "family_id": family_id,
                "email": email,
                "family_name": family_name,
                "admin_member_id": member_response.data[0].get("id") if member_response.data else None
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
            # Note: If superadmin_user_id is "superadmin" (not a UUID), set reviewed_by to NULL
            # since superadmin doesn't exist in the users table
            reviewed_by = None if superadmin_user_id == "superadmin" else superadmin_user_id
            
            update_data = {
                "status": "rejected",
                "rejection_reason": rejection_reason,
                "reviewed_by": reviewed_by,
                "reviewed_at": datetime.utcnow().isoformat()
            }
            
            request_update_response = self.supabase.table("admin_onboarding_requests").update(update_data).eq("id", request_id).execute()

            if not request_update_response.data:
                raise Exception("Failed to update onboarding request status to rejected")

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
