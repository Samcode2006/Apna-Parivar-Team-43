from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional
from core.database import get_supabase_client
from core.security import verify_token
from schemas.user import UserCreate, UserResponse, UserBase
from services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])

async def get_user_service():
    """Dependency to get user service"""
    supabase = get_supabase_client()
    return UserService(supabase)

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
        
        payload = verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return user_id
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    """Get current authenticated user profile"""
    try:
        user = await service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/create", response_model=UserResponse)
async def create_self_user(
    user_data: UserCreate,
    user_id: str = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    """Create authenticated user's own profile after magic link login"""
    try:
        # Check if user already exists
        existing_user = await service.get_user_by_id(user_id)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile already exists"
            )
        
        # Create user record with the authenticated user's ID
        new_user = await service.create_user(user_id, user_data.email, user_data.role or "family_user")
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user profile"
            )
        
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, service: UserService = Depends(get_user_service)):
    """Create a new user (SuperAdmin only)"""
    try:
        existing_user = await service.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
        
        # This would normally be called after Google OAuth, so user_id comes from auth
        # For now, we generate a placeholder
        import uuid
        user_id = str(uuid.uuid4())
        
        new_user = await service.create_user(user_id, user.email, user.role)
        if not new_user:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")
        
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, service: UserService = Depends(get_user_service)):
    """Get user by ID"""
    try:
        user = await service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/", response_model=list)
async def get_family_users(family_id: str, service: UserService = Depends(get_user_service)):
    """Get all users in a family"""
    try:
        users = await service.get_family_users(family_id)
        return users
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, update_data: dict, service: UserService = Depends(get_user_service)):
    """Update user information"""
    try:
        updated_user = await service.update_user(user_id, update_data)
        if not updated_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, service: UserService = Depends(get_user_service)):
    """Delete a user"""
    try:
        await service.delete_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
