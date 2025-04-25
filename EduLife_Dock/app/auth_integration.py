# app/auth_integration.py

import os
import requests
from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError

from app.schemas.token import TokenData

# Настройки JWT и OAuth2
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key_for_development")
ALGORITHM = "HS256"
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8070")

# Объявляем OAuth2 схему для получения токена из заголовка Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

async def verify_token_with_auth_service(token: str) -> Dict[str, Any]:
    """
    Проверяет токен через сервис аутентификации и возвращает данные пользователя
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/auth/me", headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ошибка проверки токена через сервис аутентификации",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception as e:
        # Если сервис аутентификации недоступен, пробуем проверить токен локально
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                raise ValidationError("Отсутствует поле 'sub' в токене")
            
            return {"username": username, "token_valid": True}
        except (JWTError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Не удалось подтвердить учетные данные",
                headers={"WWW-Authenticate": "Bearer"},
            )

async def get_current_user_from_auth(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Получает данные текущего пользователя из сервиса аутентификации
    """
    user_data = await verify_token_with_auth_service(token)
    return user_data

async def get_user_by_id(user_id: int, token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Получает информацию о пользователе по ID из сервиса аутентификации
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/users/{user_id}", headers=headers)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Пользователь с ID {user_id} не найден",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении данных пользователя",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обращении к сервису аутентификации: {str(e)}",
        )

async def get_student_info(user_id: int, token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Получает информацию о студенте по ID пользователя из сервиса аутентификации
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/students?user_id={user_id}", headers=headers)
        
        if response.status_code == 200:
            students = response.json()
            if students and len(students) > 0:
                return students[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Студент с ID пользователя {user_id} не найден",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении данных студента",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обращении к сервису аутентификации: {str(e)}",
        )

async def get_teacher_info(user_id: int, token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Получает информацию о преподавателе по ID пользователя из сервиса аутентификации
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/teachers?user_id={user_id}", headers=headers)
        
        if response.status_code == 200:
            teachers = response.json()
            if teachers and len(teachers) > 0:
                return teachers[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Преподаватель с ID пользователя {user_id} не найден",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении данных преподавателя",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обращении к сервису аутентификации: {str(e)}",
        )

# Функция для проверки роли пользователя
def check_user_role(required_role: str):
    """
    Проверяет, имеет ли пользователь требуемую роль
    """
    async def _check_role(user_data: Dict[str, Any] = Depends(get_current_user_from_auth)):
        role = user_data.get("role", "").lower()
        
        if required_role == "admin" and role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Требуются права администратора",
            )
        elif required_role == "teacher" and role not in ["teacher", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Требуются права преподавателя или администратора",
            )
        elif required_role == "student" and role not in ["student", "teacher", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав доступа",
            )
        
        return user_data
    
    return _check_role

# Зависимости для различных ролей
get_admin_user = check_user_role("admin")
get_teacher_user = check_user_role("teacher")
get_student_user = check_user_role("student")