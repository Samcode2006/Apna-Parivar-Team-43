from typing import Optional, List
from supabase import Client

class FamilyMemberService:
    """Service for family member management"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def create_family_member(self, family_id: str, name: str, photo_url: Optional[str] = None, 
                                   relationships: dict = {}, custom_fields: dict = {}) -> dict:
        """Create a new family member"""
        try:
            # Create family member record
            data = {
                "family_id": family_id,
                "name": name,
                "photo_url": photo_url,
                "relationships": relationships,
                "custom_fields": custom_fields
            }
            response = self.supabase.table("family_members").insert(data).execute()
            member = response.data[0] if response.data else None
            
            if not member:
                raise Exception("Failed to create family member")
            
            return member
        except Exception as e:
            raise Exception(f"Error creating family member: {str(e)}")
    
    async def get_family_member_by_id(self, member_id: str) -> dict:
        """Get family member by ID"""
        try:
            response = self.supabase.table("family_members").select("*").eq("id", member_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error fetching family member: {str(e)}")
    
    async def get_family_members(self, family_id: str) -> List[dict]:
        """Get all members in a family"""
        try:
            response = self.supabase.table("family_members").select("*").eq("family_id", family_id).execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Error fetching family members: {str(e)}")
    
    async def search_family_members(self, family_id: str, search_query: str) -> List[dict]:
        """Search family members by name"""
        try:
            response = self.supabase.table("family_members").select("*").eq("family_id", family_id).ilike("name", f"%{search_query}%").execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Error searching family members: {str(e)}")
    
    async def update_family_member(self, member_id: str, update_data: dict) -> dict:
        """Update family member information"""
        try:
            response = self.supabase.table("family_members").update(update_data).eq("id", member_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error updating family member: {str(e)}")
    
    async def delete_family_member(self, member_id: str) -> bool:
        """Delete a family member"""
        try:
            self.supabase.table("family_members").delete().eq("id", member_id).execute()
            return True
        except Exception as e:
            raise Exception(f"Error deleting family member: {str(e)}")
