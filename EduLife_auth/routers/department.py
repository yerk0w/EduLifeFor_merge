from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import departmentService
from utils.security import get_current_user, check_admin_role,get_token_data
from utils.api import get_teacher_schedule

router = APIRouter(
    prefix="/departments",
    tags=["departments"],
    dependencies=[Depends(get_current_user)]
)

class DepartmentCreate(BaseModel):
    name: str
    faculty_id: int
    head_teacher_id: Optional[int] = None

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    faculty_id: Optional[int] = None
    head_teacher_id: Optional[int] = None

class DepartmentResponse(BaseModel):
    id: int
    name: str
    faculty_id: int
    faculty_name: str
    head_teacher_id: Optional[int] = None
    head_teacher_name: Optional[str] = None

class ScheduleResponse(BaseModel):
    id: int
    date: str
    time_start: str
    time_end: str
    subject_id: int
    subject_name: str
    teacher_id: int
    group_id: int
    classroom_id: int
    classroom_name: str
    lesson_type_id: int
    lesson_type: str

@router.get("/", response_model=List[Dict[str, Any]])
async def get_departments():
    """Получить список всех кафедр"""
    return departmentService.get_departments()

@router.get("/{department_id}", response_model=Dict[str, Any])
async def get_department(department_id: int):
    """Получить информацию о конкретной кафедре"""
    department = departmentService.get_department_by_id(department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Кафедра не найдена"
        )
    return department

@router.get("/user/{user_id}", response_model=Dict[str, Any])
async def get_user_department(user_id: int):
    """Получить информацию о кафедре пользователя"""
    department = departmentService.get_user_department(user_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Кафедра пользователя не найдена"
        )
    return department

@router.get("/user/{user_id}/schedule", response_model=List[Dict[str, Any]])
async def get_user_schedule(
    user_id: int,
    token_data: Dict[str, Any] = Depends(get_token_data)
):
    """Получить расписание для преподавателя по ID"""
    schedule = get_teacher_schedule(token_data, user_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Расписание для преподавателя не найдено"
        )
    return schedule


@router.post("/", response_model=Dict[str, Any], dependencies=[Depends(check_admin_role)])
async def create_department(department: DepartmentCreate):
    """Создать новую кафедру (только для администраторов)"""
    department_id = departmentService.create_department(department.dict())
    if not department_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при создании кафедры"
        )
    
    created_department = departmentService.get_department_by_id(department_id)
    return created_department

@router.put("/{department_id}", response_model=Dict[str, Any], dependencies=[Depends(check_admin_role)])
async def update_department(department_id: int, department: DepartmentUpdate):
    """Обновить информацию о кафедре (только для администраторов)"""
    department_data = {k: v for k, v in department.dict().items() if v is not None}
    if not department_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не указаны данные для обновления"
        )
    
    updated_id = departmentService.update_department(department_id, department_data)
    if not updated_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при обновлении кафедры"
        )
    
    updated_department = departmentService.get_department_by_id(updated_id)
    return updated_department

@router.delete("/{department_id}", dependencies=[Depends(check_admin_role)])
async def delete_department(department_id: int):
    """Удалить кафедру (только для администраторов)"""
    if departmentService.delete_department(department_id):
        return {"message": "Кафедра успешно удалена"}
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Ошибка при удалении кафедры"
    )

@router.get("/by-student/{user_id}shedule", response_model=List[ScheduleResponse])
async def get_student_schedule(department_id: int):
    """Получить расписание для студентов кафедры"""
    schedule = departmentService.get_student_schedule(department_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Расписание не найдено"
        )
    
    return schedule