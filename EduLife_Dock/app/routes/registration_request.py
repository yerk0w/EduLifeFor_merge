# app/routes/registration_request.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
import requests
import os

from app.db.database import get_db
from app.schemas.registration_request import RegistrationRequestResponse, RegistrationRequestUpdate
from app.services.registration_request import get_registration_requests, get_registration_request, get_pending_registration_requests, update_registration_request_status
from app.security.jwt import get_admin_user, oauth2_scheme
from app.models.user import User

router = APIRouter(
    prefix="/registration-requests",
    tags=["registration"],
)

# URL сервиса аутентификации
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8070")

@router.get("/", response_model=List[RegistrationRequestResponse])
def read_registration_requests(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Получение всех заявок на регистрацию (только для администраторов)
    """
    return get_registration_requests(db, skip=skip, limit=limit)

@router.get("/pending", response_model=List[RegistrationRequestResponse])
def read_pending_requests(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Получение заявок на регистрацию в статусе "ожидает" (только для администраторов)
    """
    return get_pending_registration_requests(db, skip=skip, limit=limit)

@router.get("/{request_id}", response_model=RegistrationRequestResponse)
def read_registration_request(
    request_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Получение заявки на регистрацию по ID (только для администраторов)
    """
    db_request = get_registration_request(db, request_id=request_id)
    if db_request is None:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return db_request

def notify_auth_service(request_id: int, status: str, token: str):
    """
    Фоновая задача для уведомления auth-сервиса об изменении статуса заявки
    """
    try:
        # Отправляем запрос к auth-сервису для обновления статуса
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.patch(
            f"{AUTH_SERVICE_URL}/registration-requests/{request_id}",
            json={"status": status},
            headers=headers
        )
        
        if response.status_code != 200:
            print(f"Ошибка уведомления auth-сервиса: {response.text}")
    except Exception as e:
        print(f"Ошибка уведомления auth-сервиса: {str(e)}")

@router.patch("/{request_id}", response_model=RegistrationRequestResponse)
def update_request_status(
    request_id: int,
    request_update: RegistrationRequestUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
    token: str = Depends(oauth2_scheme)
):
    """
    Обновление статуса заявки на регистрацию (только для администраторов)
    """
    db_request = update_registration_request_status(db, request_id=request_id, request_update=request_update)
    if db_request is None:
        raise HTTPException(status_code=404, detail="Заявка не найдена или уже обработана")
    
    # Добавляем фоновую задачу для уведомления auth-сервиса
    background_tasks.add_task(
        notify_auth_service, 
        request_id, 
        request_update.status,
        token
    )
    
    return db_request