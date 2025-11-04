from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from core.database import get_supabase_client
from core.encryption import EncryptionService, PasswordHashingService
from schemas.user import FamilyCreate, FamilyResponse, FamilyMemberCreate, FamilyMemberResponse, FamilyMemberUpdate
from services.family_service import FamilyService
from services.family_member_service import FamilyMemberService
# Import get_auth_user directly - it's in a different router so no circular import
from routers.auth_new_router import get_auth_user

router = APIRouter(prefix="/api/families", tags=["families"])

async def get_family_service():
    """Dependency to get family service"""
    supabase = get_supabase_client()
    return FamilyService(supabase)

async def get_family_member_service():
    """Dependency to get family member service"""
    supabase = get_supabase_client()
    return FamilyMemberService(supabase)

@router.post("/", response_model=FamilyResponse, status_code=status.HTTP_201_CREATED)
async def create_family(family: FamilyCreate, service: FamilyService = Depends(get_family_service)):
    """Create a new family (SuperAdmin only)"""
    try:
        new_family = await service.create_family(family.family_name)
        if not new_family:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create family")
        return new_family
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{family_id}", response_model=FamilyResponse)
async def get_family(
    family_id: str,
    current_user: dict = Depends(get_auth_user),
    service: FamilyService = Depends(get_family_service)
):
    """Get family by ID - SuperAdmin cannot access this"""
    try:
        user_role = current_user.get("role")
        
        # SuperAdmin cannot access family details
        if user_role == "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied. SuperAdmin cannot access family details. Use the admin dashboard to manage admins."
            )
        
        # Family Admin and Family User can only access their own family
        if user_role in ["family_admin", "family_user"]:
            user_family_id = current_user.get("family_id")
            if user_family_id != family_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access Denied. You can only access your own family."
                )
        
        family = await service.get_family_by_id(family_id)
        if not family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
        return family
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/", response_model=List[FamilyResponse])
async def get_all_families(
    current_user: dict = Depends(get_auth_user),
    service: FamilyService = Depends(get_family_service)
):
    """Get families - Family Admin/User sees only their family. SuperAdmin cannot access this."""
    try:
        user_role = current_user.get("role")
        family_id = current_user.get("family_id")
        
        # SuperAdmin cannot access families
        if user_role == "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied. SuperAdmin cannot access family details. Use the admin dashboard to manage admins."
            )
        
        # Family Admin and Family User can only see their own family
        if user_role in ["family_admin", "family_user"]:
            if not family_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No family associated with your account"
                )
            family = await service.get_family_by_id(family_id)
            if not family:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Family not found"
                )
            return [family]
        
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied. You don't have permission to access this resource. Your role is not authorized for this action."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{family_id}", response_model=FamilyResponse)
async def update_family(family_id: str, update_data: dict, service: FamilyService = Depends(get_family_service)):
    """Update family information (Family Admin only)"""
    try:
        updated_family = await service.update_family(family_id, update_data)
        if not updated_family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
        return updated_family
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{family_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family(family_id: str, service: FamilyService = Depends(get_family_service)):
    """Delete a family (SuperAdmin only)"""
    try:
        await service.delete_family(family_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Nested member routes under families
@router.post("/{family_id}/members", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_family_member(
    family_id: str,
    member: FamilyMemberCreate,
    member_service: FamilyMemberService = Depends(get_family_member_service)
):
    """Create a new family member (Family Admin/Co-Admin only)"""
    try:
        new_member = await member_service.create_family_member(
            family_id=family_id,
            name=member.name,
            photo_url=member.photo_url,
            relationships=member.relationships,
            custom_fields=member.custom_fields
        )
        if not new_member:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create family member")
        return new_member
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{family_id}/members", response_model=List[FamilyMemberResponse])
async def get_family_members(
    family_id: str,
    current_user: dict = Depends(get_auth_user),
    member_service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get all members in a family - SuperAdmin cannot access this"""
    try:
        user_role = current_user.get("role")
        
        # SuperAdmin cannot access family members
        if user_role == "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied. SuperAdmin cannot access family details. Use the admin dashboard to manage admins."
            )
        
        # Family Admin and Family User can only access their own family's members
        if user_role in ["family_admin", "family_user"]:
            user_family_id = current_user.get("family_id")
            if user_family_id != family_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access Denied. You can only access your own family."
                )
        
        members = await member_service.get_family_members(family_id)
        return members
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{family_id}/members/{member_id}", response_model=FamilyMemberResponse)
async def get_family_member(
    family_id: str,
    member_id: str,
    current_user: dict = Depends(get_auth_user),
    member_service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get family member by ID - SuperAdmin cannot access this"""
    try:
        user_role = current_user.get("role")
        
        # SuperAdmin cannot access family members
        if user_role == "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied. SuperAdmin cannot access family details. Use the admin dashboard to manage admins."
            )
        
        # Family Admin and Family User can only access their own family's members
        if user_role in ["family_admin", "family_user"]:
            user_family_id = current_user.get("family_id")
            if user_family_id != family_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access Denied. You can only access your own family."
                )
        
        member = await member_service.get_family_member_by_id(member_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
        # Verify the member belongs to the family
        if member.get('family_id') != family_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
        return member
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{family_id}/members/{member_id}", response_model=FamilyMemberResponse)
async def update_family_member(
    family_id: str,
    member_id: str,
    update_data: FamilyMemberUpdate,
    member_service: FamilyMemberService = Depends(get_family_member_service)
):
    """Update family member information (Family Admin/Co-Admin only)"""
    try:
        # Verify the member belongs to the family
        member = await member_service.get_family_member_by_id(member_id)
        if not member or member.get('family_id') != family_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
        
        # Filter out None values
        data_dict = update_data.model_dump(exclude_unset=True)
        updated_member = await member_service.update_family_member(member_id, data_dict)
        if not updated_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
        return updated_member
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{family_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_member(
    family_id: str,
    member_id: str,
    member_service: FamilyMemberService = Depends(get_family_member_service)
):
    """Delete a family member (Family Admin/Co-Admin only)"""
    try:
        # Verify the member belongs to the family
        member = await member_service.get_family_member_by_id(member_id)
        if not member or member.get('family_id') != family_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
        
        await member_service.delete_family_member(member_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Endpoint for admin to retrieve family password
class PasswordRequest(BaseModel):
    admin_password: str

@router.post("/{family_id}/family-password")
async def get_family_password(
    family_id: str,
    request: PasswordRequest,
    current_user: dict = Depends(get_auth_user),
    service: FamilyService = Depends(get_family_service)
):
    """Retrieve family password (requires admin password to decrypt)"""
    try:
        # Verify user is admin of this family
        if current_user.get("role") != "family_admin" or current_user.get("family_id") != family_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only family admin can retrieve family password"
            )
        
        # Get family data
        family = await service.get_family_by_id(family_id)
        if not family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
        
        # Get admin user to verify password
        supabase = get_supabase_client()
        user_response = supabase.table("users").select("*").eq("id", current_user.get("user_id")).execute()
        
        if not user_response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        user_data = user_response.data[0]
        
        # Verify admin password
        password_hash = user_data.get("password_hash")
        if not PasswordHashingService.verify_password(request.admin_password, password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin password"
            )
        
        # Decrypt family password
        encrypted_family_password = family.get("family_password_encrypted")
        if not encrypted_family_password:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Family password not found"
            )
        
        try:
            family_password = EncryptionService.decrypt(encrypted_family_password, request.admin_password)
            return {
                "family_password": family_password,
                "message": "Family password retrieved successfully"
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to decrypt family password: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
