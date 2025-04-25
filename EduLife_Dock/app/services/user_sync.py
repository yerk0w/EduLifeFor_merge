# app/services/user_sync.py

import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import requests

from app.models.user import User
from app.auth_integration import get_user_by_id, get_student_info, get_teacher_info, get_current_user_from_auth
from app.services.user import get_user_by_username, create_user

logger = logging.getLogger(__name__)

async def sync_user_from_auth(db: Session, username: str, token: str) -> Optional[User]:
    """
    Синхронизирует информацию о пользователе из auth-сервиса
    """
    try:
        # Проверяем, есть ли пользователь в локальной БД
        local_user = get_user_by_username(db, username)
        
        # Получаем данные пользователя из auth-сервиса
        auth_user_data = await get_current_user_from_auth(token)
        
        if auth_user_data:
            auth_user_id = auth_user_data.get("id")
            
            if local_user:
                # Обновляем существующего пользователя
                local_user.email = auth_user_data.get("email", local_user.email)
                local_user.full_name = auth_user_data.get("full_name", local_user.full_name)
                local_user.role = auth_user_data.get("role", "студент").lower()
                local_user.is_active = not auth_user_data.get("disabled", False)
                local_user.auth_id = auth_user_id
                
                # Дополнительная информация
                if "telegram" in auth_user_data:
                    local_user.telegram = auth_user_data.get("telegram")
                if "phone_number" in auth_user_data:
                    local_user.phone_number = auth_user_data.get("phone_number")
                
                # Получаем специфичную информацию в зависимости от роли
                if local_user.role == "студент":
                    try:
                        student_info = await get_student_info(auth_user_id, token)
                        if student_info:
                            local_user.group_name = student_info.get("group_name")
                            local_user.faculty_name = student_info.get("faculty_name")
                    except Exception as e:
                        logger.warning(f"Не удалось получить информацию о студенте: {str(e)}")
                
                elif local_user.role == "преподаватель":
                    try:
                        teacher_info = await get_teacher_info(auth_user_id, token)
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
                user_data = {
                    "username": username,
                    "email": auth_user_data.get("email", ""),
                    "full_name": auth_user_data.get("full_name", ""),
                    "role": auth_user_data.get("role", "студент").lower(),
                    "is_active": not auth_user_data.get("disabled", False),
                    "auth_id": auth_user_id
                }
                
                # Получаем специфичную информацию в зависимости от роли
                role = user_data.get("role")
                if role == "студент":
                    try:
                        student_info = await get_student_info(auth_user_id, token)
                        if student_info:
                            user_data["group_name"] = student_info.get("group_name")
                            user_data["faculty_name"] = student_info.get("faculty_name")
                    except Exception as e:
                        logger.warning(f"Не удалось получить информацию о студенте: {str(e)}")
                
                elif role == "преподаватель":
                    try:
                        teacher_info = await get_teacher_info(auth_user_id, token)
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

async def update_user_info_from_auth(db: Session, user: User, token: str) -> User:
    """
    Обновляет дополнительную информацию о пользователе из auth-сервиса
    """
    try:
        # Получаем дополнительную информацию в зависимости от роли
        if user.auth_id:
            if user.role == "студент":
                try:
                    student_info = await get_student_info(user.auth_id, token)
                    if student_info:
                        user.group_name = student_info.get("group_name")
                        user.faculty_name = student_info.get("faculty_name")
                except Exception as e:
                    logger.warning(f"Не удалось получить информацию о студенте: {str(e)}")
            
            elif user.role == "преподаватель":
                try:
                    teacher_info = await get_teacher_info(user.auth_id, token)
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