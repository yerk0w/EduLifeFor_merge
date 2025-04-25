from datetime import timedelta
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.token import Token
from app.models.user import User
from app.services.user import authenticate_user, create_user
from app.services.user_sync import sync_user_from_auth
from app.auth import create_access_token, get_current_user_from_auth, oauth2_scheme
from app.security.password import get_password_hash
from app.config import AUTH_SERVICE_URL, ACCESS_TOKEN_EXPIRE_MINUTES
import requests
import os

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

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
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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
        # Пробуем зарегистрировать пользователя через auth-сервис
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
    except requests.RequestException as e:
        # Если auth-сервис недоступен, регистрируем пользователя локально
        try:
            # Проверяем, что пользователь не существует
            if authenticate_user(db, username, password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Пользователь с таким именем уже существует"
                )
            
            # Создаем пользователя в локальной БД
            user_data = {
                "username": username,
                "email": email,
                "full_name": full_name,
                "hashed_password": get_password_hash(password),
                "role": "студент",
                "is_active": False  # Требуется активация администратором
            }
            
            user = create_user(db, user_data)
            
            return {
                "message": "Пользователь успешно зарегистрирован локально и ожидает активации администратором",
                "user_id": user.id
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при регистрации пользователя: {str(e)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при регистрации пользователя: {str(e)}"
        )

@router.get("/me")
async def read_users_me(current_user = Depends(get_current_user_from_auth)):
    """
    Получение информации о текущем пользователе
    """
    return current_user