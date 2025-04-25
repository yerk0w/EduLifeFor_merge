from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import date
import database
from utils.security import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
    dependencies=[Depends(get_current_user)]
)


class ProfileUpdate(BaseModel):
    telegram: Optional[str] = None
    birth_date: Optional[date] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    city_id: Optional[int] = None
    college_id: Optional[int] = None
    group_name: Optional[str] = None

@router.get("/cities")
async def get_cities():
    """Get all available cities"""
    return database.get_cities()

@router.get("/colleges")
async def get_colleges(city_id: Optional[int] = None):
    """Get colleges, optionally filtered by city"""
    return database.get_colleges(city_id)

@router.get("/{user_id}")
async def get_profile(
    user_id: int, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user profile information"""
    # Only allow users to access their own profile or admins to access any profile
    if current_user["id"] != user_id and current_user["role_name"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен: вы можете просматривать только свой профиль"
        )
    
    profile = database.get_user_profile(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль не найден"
        )
    
    return profile

@router.put("/{user_id}")
async def update_profile(
    user_id: int,
    profile_data: ProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update user profile information"""
    # Only allow users to update their own profile or admins to update any profile
    if current_user["id"] != user_id and current_user["role_name"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен: вы можете обновлять только свой профиль"
        )
    
    # Validate Telegram username format
    if profile_data.telegram is not None:
        if profile_data.telegram and not profile_data.telegram.startswith('@'):
            profile_data.telegram = '@' + profile_data.telegram
    
    try:
        database.update_user_profile(user_id, profile_data.dict(exclude_unset=True))
        updated_profile = database.get_user_profile(user_id)
        return updated_profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )