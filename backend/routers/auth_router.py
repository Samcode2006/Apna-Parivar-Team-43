from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabase import Client
from core.database import get_supabase_client
from schemas.user import UserResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class EmailRequest(BaseModel):
    """Email request for magic link"""
    email: EmailStr

class SignupRequest(BaseModel):
    """Signup request"""
    email: EmailStr
    full_name: str

class MagicLinkVerificationRequest(BaseModel):
    """Magic link verification request"""
    email: str
    token: str

@router.post("/signup")
async def signup(request: SignupRequest):
    """
    Create a new user account via Supabase Auth
    Sends magic link to verify email
    
    Request:
        {
            "email": "user@gmail.com",
            "full_name": "John Doe"
        }
    
    Response:
        {
            "message": "Account created. Magic link sent to your email.",
            "email": "user@gmail.com",
            "status": "success"
        }
    """
    try:
        supabase: Client = get_supabase_client()
        
        # Check if user already exists in our database
        user_check = supabase.table("users").select("*").eq("email", request.email).execute()
        if user_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Send magic link via Supabase OTP with should_create_user=True
        # This will both create the auth user and trigger the magic link email
        response = supabase.auth.sign_in_with_otp({
            "email": request.email,
            "options": {
                "email_redirect_to": "http://localhost:3000/auth/callback",
                "should_create_user": True
            }
        })
        
        # Create user record in database with provided full_name
        # The user_id will be set by the callback after they verify their email
        # For now, we'll store a pending user or update after auth
        
        return {
            "message": "Account created successfully! Magic link sent to your email.",
            "email": request.email,
            "status": "success",
            "note": "Check your email for the verification link and click it to complete signup."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )

@router.post("/send-magic-link")
async def send_magic_link(request: EmailRequest):
    """
    Send passwordless magic link to user's Gmail address
    User clicks the link in their email to authenticate
    
    Request:
        {
            "email": "user@gmail.com"
        }
    
    Response:
        {
            "message": "Magic link sent to your email",
            "email": "user@gmail.com",
            "status": "success",
            "note": "Check your email for the login link. Link expires in 24 hours."
        }
    """
    try:
        supabase: Client = get_supabase_client()
        
        # Send magic link via Supabase OTP (One-Time Password via email)
        # Note: The redirect_to URL will have the token appended as #access_token, #refresh_token, #type
        response = supabase.auth.sign_in_with_otp({
            "email": request.email,
            "options": {
                "email_redirect_to": "http://localhost:3000/auth/callback",  # Frontend callback URL
                "should_create_user": True  # Auto-create user if they don't exist
            }
        })
        
        return {
            "message": "Magic link sent to your email",
            "email": request.email,
            "status": "success",
            "note": "Check your email for the login link. Link expires in 24 hours."
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error sending magic link: {str(e)}"
        )

@router.post("/verify-magic-link")
async def verify_magic_link(request: MagicLinkVerificationRequest):
    """
    Verify magic link token and create/authenticate user
    Called when user clicks the magic link from their email
    
    Request:
        {
            "email": "user@gmail.com",
            "token": "OTP_TOKEN_FROM_EMAIL"
        }
    
    Response:
        {
            "access_token": "jwt_token",
            "token_type": "bearer",
            "user": {user_profile_data},
            "message": "Magic link verified successfully"
        }
    """
    try:
        supabase: Client = get_supabase_client()
        
        # Verify OTP token with Supabase
        response = supabase.auth.verify_otp({
            "email": request.email,
            "token": request.token,
            "type": "email"
        })
        
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired magic link token"
            )
        
        user_id = response.user.id
        email = response.user.email
        
        # Check if user already exists in database
        user_response = supabase.table("users").select("*").eq("id", user_id).execute()
        user_data = user_response.data[0] if user_response.data else None
        
        # If user doesn't exist, create new user profile
        if not user_data:
            new_user_data = {
                "id": user_id,
                "email": email,
                "role": "family_user",  # Default role for new users
                "family_id": None
            }
            
            db_response = supabase.table("users").insert(new_user_data).execute()
            user_data = db_response.data[0] if db_response.data else new_user_data
        
        # Get session tokens
        session_data = response.session if response.session else {}
        
        return {
            "access_token": session_data.access_token if session_data else "",
            "refresh_token": session_data.refresh_token if session_data else "",
            "token_type": "bearer",
            "user": user_data,
            "message": "Magic link verified successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Magic link verification failed: {str(e)}"
        )


@router.post("/verify", response_model=UserResponse)
async def verify_token(token: str):
    """
    Verify JWT token and return user info
    Pass token in query parameter or Authorization header
    
    Request:
        ?token=jwt_token_here
    
    Response:
        {user_profile_data}
    """
    try:
        supabase: Client = get_supabase_client()
        
        # Verify token with Supabase
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get user profile from database
        user_response = supabase.table("users").select("*").eq("id", user.user.id).execute()
        user_data = user_response.data[0] if user_response.data else None
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        return user_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed"
        )

@router.post("/logout")
async def logout(token: str):
    """
    Logout user and invalidate token
    
    Request:
        ?token=jwt_token_here
    
    Response:
        {
            "message": "Logout successful",
            "status": "success"
        }
    """
    try:
        supabase: Client = get_supabase_client()
        
        # Sign out with Supabase
        supabase.auth.sign_out()
        
        return {
            "message": "Logout successful",
            "status": "success"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str):
    """
    Get current authenticated user info
    
    Request:
        ?token=jwt_token_here
    
    Response:
        {user_profile_data}
    """
    try:
        supabase: Client = get_supabase_client()
        
        # Verify token
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get user profile
        user_response = supabase.table("users").select("*").eq("id", user.user.id).execute()
        user_data = user_response.data[0] if user_response.data else None
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        return user_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get user info"
        )

@router.post("/refresh-token")
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token
    
    Request:
        ?refresh_token=refresh_token_here
    
    Response:
        {
            "access_token": "new_jwt_token",
            "refresh_token": "new_refresh_token",
            "token_type": "bearer"
        }
    """
    try:
        supabase: Client = get_supabase_client()
        
        # Refresh session
        response = supabase.auth.refresh_session(refresh_token)
        
        if not response or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token refresh failed"
            )
        
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )

