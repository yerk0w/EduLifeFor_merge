from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import database
from models import KeyCreate, KeyUpdate, KeyResponse
from utils.security import get_current_user, check_admin_role, check_teacher_or_admin_role

router = APIRouter(
    prefix="/keys",
    tags=["keys"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[KeyResponse])
async def get_keys(current_user: dict = Depends(get_current_user)):
    """Get all keys"""
    return database.get_all_keys()

@router.get("/{key_id}", response_model=KeyResponse)
async def get_key(key_id: int, current_user: dict = Depends(get_current_user)):
    """Get a specific key by ID"""
    key = database.get_key_by_id(key_id)
    if not key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Key with ID {key_id} not found"
        )
    return key



@router.post("/", response_model=dict, dependencies=[Depends(check_admin_role)])
async def create_key(key: KeyCreate, current_user: dict = Depends(check_admin_role)):
    """Create a new key (admin only)"""
    try:
        key_id = database.create_key(key.dict())
        return {"id": key_id, "message": "Key created successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{key_id}", response_model=dict, dependencies=[Depends(check_admin_role)])
async def update_key(key_id: int, key: KeyUpdate, current_user: dict = Depends(check_admin_role)):
    """Update a key (admin only)"""
    try:
        # Filter out None values
        key_data = {k: v for k, v in key.dict().items() if v is not None}
        if not key_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="No fields to update"
            )
        
        database.update_key(key_id, key_data)
        return {"id": key_id, "message": "Key updated successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{key_id}", response_model=dict, dependencies=[Depends(check_admin_role)])
async def delete_key(key_id: int, current_user: dict = Depends(check_admin_role)):
    """Delete a key (admin only)"""
    try:
        database.delete_key(key_id)
        return {"message": f"Key with ID {key_id} deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/teacher/{user_id}", response_model=List[KeyResponse])
async def get_teacher_keys(
    user_id: int, 
    current_user: dict = Depends(get_current_user)
):
    """Get all keys assigned to a specific teacher"""
    # Check if the user is requesting their own keys or is an admin
    if current_user["id"] != user_id and current_user["role"] != "admin" and current_user["role"] != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to other teachers' keys is not allowed"
        )
    
    return database.get_teacher_keys(user_id)

@router.post("/{key_id}/assign/{teacher_id}", response_model=dict, dependencies=[Depends(check_admin_role)])
async def admin_assign_key(
    key_id: int, 
    teacher_id: int, 
    notes: Optional[str] = None,
    current_user: dict = Depends(check_admin_role)
):
    """Assign a key to a teacher (admin only)"""
    try:
        database.assign_key(key_id, teacher_id, notes)
        return {"message": f"Key assigned to teacher successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{key_id}/unassign", response_model=dict, dependencies=[Depends(check_admin_role)])
async def unassign_key(
    key_id: int, 
    notes: Optional[str] = None,
    current_user: dict = Depends(check_admin_role)
):
    """Unassign a key (return to management - admin only)"""
    try:
        database.unassign_key(key_id, notes)
        return {"message": f"Key unassigned successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{key_id}/history", response_model=List[dict])
async def get_key_history(key_id: int, current_user: dict = Depends(get_current_user)):
    """Get the history for a specific key"""
    try:
        history = database.get_key_history(key_id)
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )