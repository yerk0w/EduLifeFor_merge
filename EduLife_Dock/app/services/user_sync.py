# app/services/user_sync.py

import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import requests

from app.models.user import User
from app.services.user import get_user_by_username, create_user
from app.config import AUTH_SERVICE_URL

logger = logging.getLogger(__name__)

async def sync_user_from_auth(db: Session, username: str, token: str) -> Optional[User]:
    """
    Синхронизирует информацию о пользователе из auth-сервиса
    """
    try:
        # Проверяем, есть ли пользователь в локальной БД
        local_user = get_user_by_username(db, username)
        
        # Получаем данные пользователя из auth-сервиса
        auth_user_data = await get_user_data_from_auth(token)
        
        if auth_user_data:
            auth_user_id = auth_user_data.get("id")
            
            if local_user:
                # Обновляем существующего пользователя
                local_user.email = auth_user_data.get("email", local_user.email)
                local_user.full_name = auth_user_data.get("full_name", local_user.full_name)
                
                # Приводим роль к нижнему регистру для согласованности
                role = auth_user_data.get("role", "").lower()
                if role == "teacher":
                    role = "преподаватель"
                elif role == "student":
                    role = "студент"
                elif role == "admin":
                    role = "админ"
                
                local_user.role = role
                local_user.is_active = not auth_user_data.get("disabled", False)
                local_user.auth_id = auth_user_id
                
                # Дополнительная информация
                if "telegram" in auth_user_data:
                    local_user.telegram = auth_user_data.get("telegram")
                if "phone_number" in auth_user_data:
                    local_user.phone_number = auth_user_data.get("phone_number")
                
                # Получаем специфичную информацию в зависимости от роли
                if role in ["студент", "student"]:
                    try:
                        student_info = await get_student_info_from_auth(auth_user_id, token)
                        if student_info:
                            local_user.group_name = student_info.get("group_name")
                            local_user.faculty_name = student_info.get("faculty_name")
                    except Exception as e:
                        logger.warning(f"Не удалось получить информацию о студенте: {str(e)}")
                
                elif role in ["преподаватель", "teacher"]:
                    try:
                        teacher_info = await get_teacher_info_from_auth(auth_user_id, token)
                        if teacher_info:
                            local_user.department_name = teacher_info.get("department_name")
                            local_user.position = teacher_info.get("position")
                    except Exception as e:
                        logger.warning(f"Не удалось получить информацию о преподавателе: {str(e)}")
                
                db.commit()
                db.refresh(local_user)
                return local_user
            else:
                # Создаем нового пользователя
                # Приводим роль к нижнему регистру для согласованности
                role = auth_user_data.get("role", "").lower()
                if role == "teacher":
                    role = "преподаватель"
                elif role == "student":
                    role = "студент"
                elif role == "admin":
                    role = "админ"
                
                user_data = {
                    "username": username,
                    "email": auth_user_data.get("email", ""),
                    "full_name": auth_user_data.get("full_name", ""),
                    "role": role,
                    "is_active": not auth_user_data.get("disabled", False),
                    "auth_id": auth_user_id
                }
                
                # Получаем специфичную информацию в зависимости от роли
                if role in ["студент", "student"]:
                    try:
                        student_info = await get_student_info_from_auth(auth_user_id, token)
                        if student_info:
                            user_data["group_name"] = student_info.get("group_name")
                            user_data["faculty_name"] = student_info.get("faculty_name")
                    except Exception as e:
                        logger.warning(f"Не удалось получить информацию о студенте: {str(e)}")
                
                elif role in ["преподаватель", "teacher"]:
                    try:
                        teacher_info = await get_teacher_info_from_auth(auth_user_id, token)
                        if teacher_info:
                            user_data["department_name"] = teacher_info.get("department_name")
                            user_data["position"] = teacher_info.get("position")
                    except Exception as e:
                        logger.warning(f"Не удалось получить информацию о преподавателе: {str(e)}")
                
                # Создаем пользователя
                return create_user(db, user_data)
        
        return None
    except Exception as e:
        logger.error(f"Ошибка синхронизации пользователя: {str(e)}")
        return None

async def get_user_data_from_auth(token: str) -> Dict[str, Any]:
    """
    Получает данные пользователя из auth-сервиса
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/auth/me", headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.warning(f"Ошибка получения данных пользователя из auth-сервиса: {response.text}")
            return {}
    except Exception as e:
        logger.error(f"Ошибка при запросе к auth-сервису: {str(e)}")
        return {}

async def get_student_info_from_auth(user_id: int, token: str) -> Dict[str, Any]:
    """
    Получает информацию о студенте из auth-сервиса
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/students?user_id={user_id}", headers=headers)
        
        if response.status_code == 200:
            students = response.json()
            if students and len(students) > 0:
                return students[0]
            else:
                logger.warning(f"Студент с ID пользователя {user_id} не найден")
                return {}
        else:
            logger.warning(f"Ошибка получения информации о студенте: {response.text}")
            return {}
    except Exception as e:
        logger.error(f"Ошибка при запросе к auth-сервису: {str(e)}")
        return {}

async def get_teacher_info_from_auth(user_id: int, token: str) -> Dict[str, Any]:
    """
    Получает информацию о преподавателе из auth-сервиса
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/teachers?user_id={user_id}", headers=headers)
        
        if response.status_code == 200:
            teachers = response.json()
            if teachers and len(teachers) > 0:
                return teachers[0]
            else:
                logger.warning(f"Преподаватель с ID пользователя {user_id} не найден")
                return {}
        else:
            logger.warning(f"Ошибка получения информации о преподавателе: {response.text}")
            return {}
    except Exception as e:
        logger.error(f"Ошибка при запросе к auth-сервису: {str(e)}")
        return {}

async def update_user_info_from_auth(db: Session, user: User, token: str) -> User:
    """
    Обновляет дополнительную информацию о пользователе из auth-сервиса
    """
    try:
        # Получаем дополнительную информацию в зависимости от роли
        if user.auth_id:
            if user.role in ["студент", "student"]:
                try:
                    student_info = await get_student_info_from_auth(user.auth_id, token)
                    if student_info:
                        user.group_name = student_info.get("group_name")
                        user.faculty_name = student_info.get("faculty_name")
                except Exception as e:
                    logger.warning(f"Не удалось получить информацию о студенте: {str(e)}")
            
            elif user.role in ["преподаватель", "teacher"]:
                try:
                    teacher_info = await get_teacher_info_from_auth(user.auth_id, token)
                    if teacher_info:
                        user.department_name = teacher_info.get("department_name")
                        user.position = teacher_info.get("position")
                except Exception as e:
                    logger.warning(f"Не удалось получить информацию о преподавателе: {str(e)}")
            
            db.commit()
            db.refresh(user)
        
        return user
    except Exception as e:
        logger.error(f"Ошибка обновления информации о пользователе: {str(e)}")
        return user