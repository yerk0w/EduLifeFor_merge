from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
import database
from utils.security import get_current_user, check_admin_role

router = APIRouter(
    prefix="/departments",
    tags=["departments"],
    dependencies=[Depends(get_current_user)]
)

class DepartmentCreate(BaseModel):
    name: str
    faculty_id: int
    head_teacher_id: int = None

class DepartmentUpdate(BaseModel):
    name: str = None
    faculty_id: int = None
    head_teacher_id: int = None

class DepartmentResponse(BaseModel):
    id: int
    name: str
    faculty_id: int
    faculty_name: str
    head_teacher_id: int = None
    head_teacher_name: str = None
    created_at: str

@router.get("/", response_model=List[DepartmentResponse])
async def get_departments():
    """Получить список всех кафедр"""
    departments = database.get_all_departments()
    return departments

@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(department_id: int):
    """Получить информацию о конкретной кафедре"""
    department = database.get_department_by_id(department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Кафедра не найдена"
        )
    return department

@router.post("/", response_model=DepartmentResponse, dependencies=[Depends(check_admin_role)])
async def create_department(department: DepartmentCreate):
    """Создать новую кафедру (только для администраторов)"""
    try:
        department_id = database.create_department({
            "name": department.name,
            "faculty_id": department.faculty_id,
            "head_teacher_id": department.head_teacher_id
        })
        return database.get_department_by_id(department_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{department_id}", response_model=DepartmentResponse, dependencies=[Depends(check_admin_role)])
async def update_department(department_id: int, department: DepartmentUpdate):
    """Обновить информацию о кафедре (только для администраторов)"""
    try:
        department_data = {k: v for k, v in department.dict().items() if v is not None}
        if not department_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не указаны данные для обновления"
            )
        updated_id = database.update_department(department_id, department_data)
        department = database.get_department_by_id(updated_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Кафедра не найдена"
            )
        return department
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{department_id}", dependencies=[Depends(check_admin_role)])
async def delete_department(department_id: int):
    """Удалить кафедру (только для администраторов)"""
    try:
        if database.delete_department(department_id):
            return {"message": "Кафедра успешно удалена"}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Кафедра не найдена"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )