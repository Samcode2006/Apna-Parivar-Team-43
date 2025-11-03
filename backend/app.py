from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import user_router, family_router, family_member_router, health_router, auth_router, auth_new_router

# Create FastAPI app
app = FastAPI(
    title="ApnaParivar Backend",
    description="A secure, multi-tenant family tree platform",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router.router)
app.include_router(auth_new_router.router)  # New auth system
app.include_router(auth_router.router)  # Legacy auth (can be deprecated)
app.include_router(user_router.router)
app.include_router(family_router.router)
app.include_router(family_member_router.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to ApnaParivar Backend",
        "version": "2.0.0",
        "docs": "/docs",
        "auth_flows": {
            "superadmin": "POST /api/auth/superadmin/login",
            "admin_register": "POST /api/auth/admin/register",
            "admin_login": "POST /api/auth/admin/login",
            "member_login": "POST /api/auth/member/login"
        }
    }




