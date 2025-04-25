from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import parse_obj_as

from app.db.database import get_db
from app.schemas.template import TemplateResponse, TemplateCreate, TemplateUpdate
from app.services.template import get_templates, get_template, get_templates_by_role, create_template, update_template, delete_template
from app.auth import get_current_user_from_auth, get_admin_user

router = APIRouter(
    prefix="/templates",
    tags=["templates"],
)
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.db.database import get_db
from app.models.user import User
from app.security.jwt import get_current_active_user
from app.services.template import get_template

# Add this to your existing router

@router.get("/{template_id}/download")
async def download_template(
    template_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Download a template file
    """
    db_template = get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    
    # Check if user has access to the template
    if current_user.role == "студент" and not db_template.available_for_students:
        raise HTTPException(status_code=403, detail="Нет доступа к этому шаблону")
    elif current_user.role == "преподаватель" and not db_template.available_for_teachers:
        raise HTTPException(status_code=403, detail="Нет доступа к этому шаблону")
    
    # Get the full file path
    file_path = os.path.join(os.getcwd(), "app", db_template.file_path.lstrip('/'))
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Файл шаблона не найден")
    
    # Return file for download, using the template name as the filename
    return FileResponse(
        path=file_path, 
        filename=f"{db_template.name}.pdf", 
        media_type="application/pdf"
    )

@router.get("/", response_model=List[TemplateResponse])
def read_templates(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_auth)
):
    """
    Получение шаблонов, доступных для текущего пользователя
    """
    user_role = current_user.get("role", "").lower()
    return get_templates_by_role(db, user_role, skip=skip, limit=limit)

@router.get("/all", response_model=List[TemplateResponse])
def read_all_templates(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Получение всех шаблонов (только для администраторов)
    """
    return get_templates(db, skip=skip, limit=limit)

@router.get("/{template_id}", response_model=TemplateResponse)
def read_template(
    template_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_auth)
):
    """
    Получение шаблона по ID
    """
    user_role = current_user.get("role", "").lower()
    
    db_template = get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    
    # Проверяем доступ пользователя к шаблону
    if user_role == "student" or user_role == "студент":
        if not db_template.available_for_students:
            raise HTTPException(status_code=403, detail="Нет доступа к этому шаблону")
    elif user_role == "teacher" or user_role == "преподаватель":
        if not db_template.available_for_teachers:
            raise HTTPException(status_code=403, detail="Нет доступа к этому шаблону")
    
    return db_template

@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def upload_template(
    name: str = Form(...),
    description: str = Form(None),
    available_for_students: bool = Form(True),
    available_for_teachers: bool = Form(True),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Загрузка нового шаблона (только для администраторов)
    """
    template_data = {
        "name": name,
        "description": description,
        "available_for_students": available_for_students,
        "available_for_teachers": available_for_teachers
    }
    template = parse_obj_as(TemplateCreate, template_data)
    return await create_template(db, template, file)

@router.put("/{template_id}", response_model=TemplateResponse)
def update_template_info(
    template_id: int,
    template_update: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Обновление информации о шаблоне (только для администраторов)
    """
    db_template = update_template(db, template_id=template_id, template_update=template_update)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    return db_template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_by_id(
    template_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Удаление шаблона (только для администраторов)
    """
    success = delete_template(db, template_id=template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    return None