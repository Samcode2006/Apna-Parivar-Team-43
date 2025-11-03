from typing import Optional
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    role: str  # super_admin, family_admin, family_co_admin, family_user

class UserResponse(UserBase):
    id: str
    family_id: Optional[str]
    role: str
    approval_status: Optional[str] = "approved"
    full_name: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Family Schemas
class FamilyBase(BaseModel):
    family_name: str

class FamilyCreate(FamilyBase):
    pass

class FamilyResponse(FamilyBase):
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Family Member Schemas
class FamilyMemberBase(BaseModel):
    name: str
    photo_url: Optional[str] = None
    relationships: dict = {}
    custom_fields: dict = {}

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    relationships: Optional[dict] = None
    custom_fields: Optional[dict] = None

class FamilyMemberResponse(FamilyMemberBase):
    id: str
    family_id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str
    user: UserResponse

# SuperAdmin Login
class SuperAdminLoginRequest(BaseModel):
    """SuperAdmin login with hardcoded credentials"""
    username: str
    password: str

# Family Admin Signup/Onboarding
class AdminOnboardingRequest(BaseModel):
    """Family admin signup request - awaits SuperAdmin approval"""
    email: EmailStr
    full_name: str
    family_name: str
    password: str
    confirm_password: str

class AdminOnboardingResponse(BaseModel):
    """Response for admin onboarding request"""
    request_id: str
    status: str  # pending, approved, rejected
    message: str
    family_password: Optional[str] = None  # Only shown on creation
    rejection_reason: Optional[str] = None

# Family Member Login
class FamilyMemberLoginRequest(BaseModel):
    """Family member login with email + family name + family password"""
    email: EmailStr
    family_name: str
    family_password: str

class AdminApprovalRequest(BaseModel):
    """SuperAdmin action to approve/reject admin request"""
    request_id: str
    action: str  # approve or reject
    admin_password: Optional[str] = None  # Required for approve
    rejection_reason: Optional[str] = None  # Required for reject
