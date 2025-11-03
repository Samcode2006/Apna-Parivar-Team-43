import os
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")

# JWT Configuration
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Application Configuration
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
ENV = os.getenv("ENV", "development")

# SuperAdmin Configuration (Hardcoded credentials)
SUPERADMIN_USERNAME = os.getenv("SUPERADMIN_USERNAME", "superadmin")
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "SuperAdmin@123")
SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL", "admin@apnaparivar.com")

# Security
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")

