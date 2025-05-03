import os
import requests
from fastapi import Depends, HTTPException, status, Header
from typing import Dict, Any, Optional

# Configuration
AUTH_API_URL = os.getenv("AUTH_API_URL", "http://localhost:8070")

def get_token_data(authorization: str = Header(...)) -> Dict[str, Any]:
    """Extracts data from JWT token in the Authorization header"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not authorization.startswith("Bearer "):
        raise credentials_exception
    
    token = authorization[len("Bearer "):]
    
    # Verify token with auth service
    try:
        response = requests.get(
            f"{AUTH_API_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise credentials_exception
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error connecting to authentication service: {str(e)}"
        )

async def get_current_user(token_data: Dict[str, Any] = Depends(get_token_data)) -> Dict[str, Any]:
    """Returns the current user based on the token"""
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token_data

async def check_admin_role(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Checks if the current user has admin role"""
    # Check if role is in 'role_name' or 'role' field
    user_role = current_user.get("role_name") or current_user.get("role")
    
    if not user_role or user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions, admin role required"
        )
    
    return current_user

async def check_teacher_or_admin_role(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Checks if the current user has teacher or admin role"""
    # Check if role is in 'role_name' or 'role' field
    user_role = current_user.get("role_name") or current_user.get("role")
    
    if not user_role or user_role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions, admin or teacher role required"
        )
    
    return current_user

async def get_teacher_info(teacher_id: int, token: str) -> Dict[str, Any]:
    """Get teacher information from the auth service"""
    try:
        response = requests.get(
            f"{AUTH_API_URL}/teachers/{teacher_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            return None
        else:
            raise Exception(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error connecting to authentication service: {str(e)}"
        )

async def get_teacher_by_user_id(user_id: int, token: str) -> Optional[Dict[str, Any]]:
    """Get teacher ID from user ID"""
    try:
        response = requests.get(
            f"{AUTH_API_URL}/teachers/by-user/{user_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            return None
        else:
            raise Exception(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error connecting to authentication service: {str(e)}"
        )