from datetime import timedelta
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.token import Token
from app.models.user import User
from app.services.user import get_user_by_username, authenticate_user, create_user
from app.services.user_sync import sync_user_from_auth
from app.security.jwt import create_access_token, get_current_user, get_current_active_user
from app.security.password import get_password_hash
import requests
import os

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

# URL сервиса аутентификации
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8070")

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Получение JWT-токена для авторизации
    """
    # Сначала проверяем локальную аутентификацию
    user = authenticate_user(db, form_data.username, form_data.password)
    
    # Если локальная аутентификация не удалась, пробуем через auth-сервис
    if not user:
        try:
            # Пробуем авторизоваться через сервис аутентификации
            auth_response = requests.post(
                f"{AUTH_SERVICE_URL}/auth/login",
                data={
                    "username": form_data.username,
                    "password": form_data.password
                }
            )
            
            if auth_response.status_code == 200:
                auth_data = auth_response.json()
                
                # Получаем или создаем пользователя в локальной БД
                user = await sync_user_from_auth(
                    db, 
                    form_data.username, 
                    auth_data["access_token"]
                )
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Ошибка синхронизации пользователя из auth-сервиса"
                    )
                
                # Возвращаем токен из auth-сервиса
                return {
                    "access_token": auth_data["access_token"],
                    "token_type": auth_data["token_type"]
                }
        except Exception as e:
            # Если не удалось авторизоваться через auth-сервис, выдаем стандартную ошибку
            pass
    
    # Если и локальная, и удаленная аутентификация не удались
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Локальная аутентификация успешна, выдаем токен
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
async def register_user(
    username: str,
    email: str,
    full_name: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Регистрация нового пользователя через auth-сервис
    """
    try:
        # Проверяем, что пользователь не существует в локальной БД
        local_user = get_user_by_username(db, username)
        if local_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует"
            )
        
        # Регистрируем пользователя через auth-сервис
        auth_response = requests.post(
            f"{AUTH_SERVICE_URL}/auth/register",
            json={
                "username": username,
                "email": email,
                "full_name": full_name,
                "password": password
            }
        )
        
        if auth_response.status_code == 200:
            auth_user = auth_response.json()
            
            # Создаем пользователя в локальной БД
            user_data = {
                "username": username,
                "email": email,
                "full_name": full_name,
                "hashed_password": get_password_hash(password),  # Хешируем пароль локально
                "role": "студент",  # По умолчанию роль - студент
                "is_active": False  # Пользователь не активирован до подтверждения в auth-сервисе
            }
            
            user = create_user(db, user_data)
            
            return {
                "message": "Пользователь успешно зарегистрирован и ожидает активации администратором",
                "user_id": user.id
            }
        else:
            # Возвращаем ошибку из auth-сервиса
            auth_error = auth_response.json()
            raise HTTPException(
                status_code=auth_response.status_code,
                detail=auth_error.get("detail", "Ошибка регистрации")
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при регистрации пользователя: {str(e)}"
        )

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Получение информации о текущем пользователе
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "auth_id": current_user.auth_id,
        "group_name": current_user.group_name,
        "faculty_name": current_user.faculty_name,
        "department_name": current_user.department_name,
        "position": current_user.position
    }