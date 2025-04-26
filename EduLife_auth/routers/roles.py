
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
import database
from utils.security import get_current_user, check_admin_role

router = APIRouter(
    prefix="/roles",
    tags=["roles"],
    dependencies=[Depends(get_current_user)]
)

class RoleResponse(BaseModel):
    id: int
    name: str
    display_name: str = None
    permissions: str

@router.get("/", response_model=List[RoleResponse])
async def get_roles(current_user = Depends(check_admin_role)):
    """Получить список всех ролей (только для администраторов)"""
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, name, permissions FROM roles ORDER BY id")
        roles = cursor.fetchall()
        
        result = []
        for role in roles:
            # Добавляем человекочитаемые названия ролей
            display_name = role['name']
            if role['name'] == 'admin':
                display_name = 'Администратор'
            elif role['name'] == 'teacher':
                display_name = 'Преподаватель'
            elif role['name'] == 'student':
                display_name = 'Студент'
            
            result.append({
                'id': role['id'],
                'name': role['name'],
                'display_name': display_name,
                'permissions': role['permissions']
            })
            
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении ролей: {str(e)}"
        )
    finally:
        conn.close()