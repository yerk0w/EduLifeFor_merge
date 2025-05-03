from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import database
from models import KeyHistoryEntry
from utils.security import get_current_user, check_admin_role

router = APIRouter(
    prefix="/history",
    tags=["history"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/key/{key_id}", response_model=List[KeyHistoryEntry])
async def get_key_history(
    key_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get the complete history for a specific key"""
    try:
        return database.get_key_history(key_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/teacher/{teacher_id}", response_model=List[KeyHistoryEntry])
async def get_teacher_history(
    teacher_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get the key history for a specific teacher"""
    # Check if the user is requesting their own history or is an admin
    if current_user["id"] != teacher_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to other teachers' history is not allowed"
        )
    
    try:
        return database.get_teacher_key_history(teacher_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[KeyHistoryEntry], dependencies=[Depends(check_admin_role)])
async def get_complete_history(
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    current_user: dict = Depends(check_admin_role)
):
    """Get the complete key history (admin only)"""
    try:
        conn = database.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                kh.id, kh.key_id, kh.from_teacher_id, kh.to_teacher_id, 
                kh.action, kh.timestamp, kh.notes,
                k.key_code, k.room_number, k.building
            FROM key_history kh
            JOIN keys k ON kh.key_id = k.id
            ORDER BY kh.timestamp DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        
        history = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/stats", response_model=dict, dependencies=[Depends(check_admin_role)])
async def get_history_stats(
    current_user: dict = Depends(check_admin_role)
):
    """Get statistics from the key history (admin only)"""
    try:
        conn = database.get_db_connection()
        cursor = conn.cursor()
        
        # Get counts by action type
        cursor.execute("""
            SELECT action, COUNT(*) as count
            FROM key_history
            GROUP BY action
            ORDER BY count DESC
        """)
        
        action_counts = {row["action"]: row["count"] for row in cursor.fetchall()}
        
        # Get top 5 teachers with most key movements
        cursor.execute("""
            SELECT 
                teacher_id, 
                COUNT(*) as count
            FROM (
                SELECT from_teacher_id as teacher_id
                FROM key_history
                WHERE from_teacher_id IS NOT NULL
                UNION ALL
                SELECT to_teacher_id as teacher_id
                FROM key_history
            )
            GROUP BY teacher_id
            ORDER BY count DESC
            LIMIT 5
        """)
        
        top_teachers = [{"teacher_id": row["teacher_id"], "count": row["count"]} 
                       for row in cursor.fetchall()]
        
        # Get most transferred keys
        cursor.execute("""
            SELECT 
                k.id, k.key_code, k.room_number, k.building,
                COUNT(*) as transfer_count
            FROM key_history kh
            JOIN keys k ON kh.key_id = k.id
            WHERE kh.action = 'transfer'
            GROUP BY kh.key_id
            ORDER BY transfer_count DESC
            LIMIT 5
        """)
        
        top_keys = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            "action_counts": action_counts,
            "top_teachers": top_teachers,
            "top_keys": top_keys
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting history stats: {str(e)}"
        )