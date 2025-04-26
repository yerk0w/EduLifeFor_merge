import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
import requests

from app.db.database import get_db
from app.schemas.token import TokenData
from app.config import APP_SECRET_KEY, AUTH_SERVICE_URL, ACCESS_TOKEN_EXPIRE_MINUTES, JWT_ALGORITHM, DEMO_MODE, DEMO_USER

# Настройка логирования
logger = logging.getLogger(__name__)

# Используем секретный ключ из конфигурации
SECRET_KEY = APP_SECRET_KEY

# OAuth2 схема для получения токена из заголовка Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Создание JWT-токена
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def verify_token_with_auth_service(token: str) -> Dict[str, Any]:
    """
    Проверяет токен через сервис аутентификации и возвращает данные пользователя.
    Если сервис аутентификации недоступен, пробует проверить токен локально.
    """
    if not token:
        if DEMO_MODE:
            logger.warning("Работаем в демо-режиме без токена")
            return DEMO_USER
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется аутентификация",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/auth/me", headers=headers, timeout=5)
        
        if response.status_code == 200:
            user_data = response.json()
            logger.debug(f"Данные пользователя из auth-сервиса: {user_data}")
            return user_data
        else:
            logger.warning(f"Ошибка получения данных из auth-сервиса: {response.status_code}")
            # Если сервис аутентификации недоступен, пробуем проверить токен локально
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
                username: str = payload.get("sub")
                if username is None:
                    raise ValidationError("Отсутствует поле 'sub' в токене")
                
                # В демо-режиме возвращаем демо-пользователя
                if DEMO_MODE:
                    return DEMO_USER
                
                return {"username": username, "token_valid": True}
            except (JWTError, ValidationError) as e:
                logger.error(f"Ошибка при локальной проверке токена: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Не удалось подтвердить учетные данные",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    except requests.RequestException as e:
        logger.warning(f"Ошибка при обращении к auth-сервису: {str(e)}")
        # Пробуем проверить токен локально
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                raise ValidationError("Отсутствует поле 'sub' в токене")
            
            # В демо-режиме возвращаем демо-пользователя
            if DEMO_MODE:
                return DEMO_USER
            
            return {"username": username, "token_valid": True}
        except (JWTError, ValidationError) as e:
            logger.error(f"Ошибка при локальной проверке токена: {str(e)}")
            # В демо-режиме возвращаем демо-пользователя даже при ошибке
            if DEMO_MODE:
                return DEMO_USER
                
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Не удалось подтвердить учетные данные",
                headers={"WWW-Authenticate": "Bearer"},
            )

async def get_current_user_from_auth(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Получает данные текущего пользователя из сервиса аутентификации
    или из локальной проверки токена.
    В демо-режиме возвращает данные демо-пользователя.
    """
    if DEMO_MODE and not token:
        return DEMO_USER
        
    try:
        user_data = await verify_token_with_auth_service(token)
        return user_data
    except HTTPException as e:
        if DEMO_MODE:
            logger.warning("Возвращаем демо-пользователя при ошибке аутентификации")
            return DEMO_USER
        raise e

# Функция для получения пользователя по ID
async def get_user_by_id(user_id: int, token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Получает информацию о пользователе по ID из сервиса аутентификации
    """
    # В демо-режиме возвращаем демо-пользователя
    if DEMO_MODE:
        demo_user = DEMO_USER.copy()
        demo_user["id"] = user_id
        return demo_user
        
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/users/{user_id}", headers=headers, timeout=5)
        
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
    except requests.RequestException as e:
        logger.error(f"Ошибка при обращении к сервису аутентификации: {str(e)}")
        
        # В демо-режиме возвращаем демо-пользователя при ошибке
        if DEMO_MODE:
            demo_user = DEMO_USER.copy()
            demo_user["id"] = user_id
            return demo_user
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обращении к сервису аутентификации: {str(e)}",
        )

# Функция для получения информации о студенте
async def get_student_info(user_id: int, token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Получает информацию о студенте по ID пользователя из сервиса аутентификации
    """
    # В демо-режиме возвращаем демо-данные
    if DEMO_MODE:
        return {
            "id": 1,
            "user_id": user_id,
            "group_id": 1,
            "group_name": "ИТ-101",
            "student_id": "S" + str(10000 + user_id),
            "faculty_name": "Факультет информационных технологий"
        }
        
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/students?user_id={user_id}", headers=headers, timeout=5)
        
        if response.status_code == 200:
            students = response.json()
            if students and len(students) > 0:
                return students[0]
            else:
                # В случае отсутствия данных возвращаем базовую информацию
                if DEMO_MODE:
                    return {
                        "id": 1,
                        "user_id": user_id,
                        "group_id": 1,
                        "group_name": "ИТ-101",
                        "student_id": "S" + str(10000 + user_id),
                        "faculty_name": "Факультет информационных технологий"
                    }
                    
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Студент с ID пользователя {user_id} не найден",
                )
        else:
            if DEMO_MODE:
                return {
                    "id": 1,
                    "user_id": user_id,
                    "group_id": 1,
                    "group_name": "ИТ-101",
                    "student_id": "S" + str(10000 + user_id),
                    "faculty_name": "Факультет информационных технологий"
                }
                
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении данных студента",
            )
    except requests.RequestException as e:
        logger.error(f"Ошибка при обращении к сервису аутентификации: {str(e)}")
        
        # В демо-режиме возвращаем демо-данные при ошибке
        if DEMO_MODE:
            return {
                "id": 1,
                "user_id": user_id,
                "group_id": 1,
                "group_name": "ИТ-101",
                "student_id": "S" + str(10000 + user_id),
                "faculty_name": "Факультет информационных технологий"
            }
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обращении к сервису аутентификации: {str(e)}",
        )

# Функция для получения информации о преподавателе
async def get_teacher_info(user_id: int, token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Получает информацию о преподавателе по ID пользователя из сервиса аутентификации
    """
    # В демо-режиме возвращаем демо-данные
    if DEMO_MODE:
        return {
            "id": 1,
            "user_id": user_id,
            "department_id": 1,
            "department_name": "Кафедра информационных технологий",
            "position": "Доцент"
        }
        
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/teachers?user_id={user_id}", headers=headers, timeout=5)
        
        if response.status_code == 200:
            teachers = response.json()
            if teachers and len(teachers) > 0:
                return teachers[0]
            else:
                # В случае отсутствия данных возвращаем базовую информацию
                if DEMO_MODE:
                    return {
                        "id": 1,
                        "user_id": user_id,
                        "department_id": 1,
                        "department_name": "Кафедра информационных технологий",
                        "position": "Доцент"
                    }
                    
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Преподаватель с ID пользователя {user_id} не найден",
                )
        else:
            if DEMO_MODE:
                return {
                    "id": 1,
                    "user_id": user_id,
                    "department_id": 1,
                    "department_name": "Кафедра информационных технологий",
                    "position": "Доцент"
                }
                
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении данных преподавателя",
            )
    except requests.RequestException as e:
        logger.error(f"Ошибка при обращении к сервису аутентификации: {str(e)}")
        
        # В демо-режиме возвращаем демо-данные при ошибке
        if DEMO_MODE:
            return {
                "id": 1,
                "user_id": user_id,
                "department_id": 1,
                "department_name": "Кафедра информационных технологий",
                "position": "Доцент"
            }
            
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
        # В демо-режиме не проверяем роли
        if DEMO_MODE:
            return user_data
            
        role = user_data.get("role", "").lower()
        
        if required_role == "admin" and role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Требуются права администратора",
            )
        elif required_role == "teacher" and role not in ["teacher", "admin", "преподаватель"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Требуются права преподавателя или администратора",
            )
        elif required_role == "student" and role not in ["student", "teacher", "admin", "студент", "преподаватель"]:
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