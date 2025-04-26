# app/services/user.py

from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import requests
import os

from app.models.user import User
from app.models.registration_request import RegistrationRequest
from app.schemas.user import UserCreate, UserUpdate
from app.security.password import get_password_hash, verify_password

# URL сервиса аутентификации
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8070")

def get_user(db: Session, user_id: int):
    """
    Получение пользователя по ID
    """
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    """
    Получение пользователя по имени пользователя
    """
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """
    Получение пользователя по email
    """
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Получение списка пользователей
    """
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user_data: dict):
    """
    Создание нового пользователя и заявки на регистрацию
    """
    # Проверяем, есть ли пользователь с таким username или email
    if get_user_by_username(db, user_data["username"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем уже существует"
        )
    if "email" in user_data and get_user_by_email(db, user_data["email"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует"
        )
    
    # Создаем хеш пароля, если он передан
    if "password" in user_data:
        user_data["hashed_password"] = get_password_hash(user_data["password"])
        del user_data["password"]
    
    # Создаем пользователя
    db_user = User(
        username=user_data["username"],
        email=user_data.get("email", ""),
        full_name=user_data.get("full_name", ""),
        hashed_password=user_data.get("hashed_password"),
        role=user_data.get("role", "студент"),
        is_active=user_data.get("is_active", False),
        auth_id=user_data.get("auth_id"),
        telegram=user_data.get("telegram"),
        phone_number=user_data.get("phone_number"),
        faculty_name=user_data.get("faculty_name"),
        group_name=user_data.get("group_name"),
        department_name=user_data.get("department_name"),
        position=user_data.get("position")
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Создаем заявку на регистрацию, если пользователь не активирован через auth-сервис
    if not db_user.is_active and not db_user.auth_id:
        db_request = RegistrationRequest(
            user_id=db_user.id,
            requested_role=db_user.role,
            status="ожидает"
        )
        db.add(db_request)
        db.commit()
        db.refresh(db_request)
    
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    """
    Аутентификация пользователя
    """
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not user.hashed_password:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    if not user.is_active:
        return False
    return user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    """
    Обновление данных пользователя
    """
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    # Обновляем только переданные поля
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key == "auth_id" and db_user.auth_id:
            # Не обновляем auth_id, если он уже установлен
            continue
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def change_user_password(db: Session, user_id: int, old_password: str, new_password: str):
    """
    Изменение пароля пользователя
    """
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    # Проверяем старый пароль
    if not verify_password(old_password, db_user.hashed_password):
        return False
    
    # Устанавливаем новый пароль
    db_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    # Если есть auth_id, пробуем обновить пароль в auth-сервисе
    if db_user.auth_id:
        try:
            response = requests.post(
                f"{AUTH_SERVICE_URL}/users/{db_user.auth_id}/change-password",
                json={
                    "old_password": old_password,
                    "new_password": new_password
                }
            )
            
            if response.status_code != 200:
                print(f"Ошибка обновления пароля в auth-сервисе: {response.text}")
        except Exception as e:
            print(f"Ошибка при обращении к auth-сервису: {str(e)}")
    
    return True

def sync_users_with_auth_service(db: Session, token: str):
    """
    Синхронизация пользователей с auth-сервисом
    """
    try:
        # Получаем список пользователей из auth-сервиса
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{AUTH_SERVICE_URL}/users", headers=headers)
        
        if response.status_code == 200:
            auth_users = response.json()
            
            for auth_user in auth_users:
                # Проверяем, есть ли пользователь в локальной БД
                local_user = get_user_by_username(db, auth_user["username"])
                
                if local_user:
                    # Обновляем существующего пользователя
                    local_user.email = auth_user.get("email", local_user.email)
                    local_user.full_name = auth_user.get("full_name", local_user.full_name)
                    local_user.role = auth_user.get("role_name", "студент").lower()
                    local_user.is_active = not auth_user.get("disabled", False)
                    local_user.auth_id = auth_user["id"]
                    
                    db.commit()
                    db.refresh(local_user)
                else:
                    # Создаем нового пользователя
                    user_data = {
                        "username": auth_user["username"],
                        "email": auth_user.get("email", ""),
                        "full_name": auth_user.get("full_name", ""),
                        "role": auth_user.get("role_name", "студент").lower(),
                        "is_active": not auth_user.get("disabled", False),
                        "auth_id": auth_user["id"]
                    }
                    create_user(db, user_data)
            
            return True
        else:
            print(f"Ошибка получения пользователей из auth-сервиса: {response.text}")
            return False
    except Exception as e:
        print(f"Ошибка при синхронизации с auth-сервисом: {str(e)}")
        return False