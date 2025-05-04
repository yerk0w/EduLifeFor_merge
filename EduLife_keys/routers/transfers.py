from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import database
from models import KeyTransferCreate, KeyTransferUpdate, KeyTransferResponse
from utils.security import get_current_user, check_admin_role, check_teacher_or_admin_role

router = APIRouter(
    prefix="/transfers",
    tags=["transfers"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[KeyTransferResponse], dependencies=[Depends(check_admin_role)])
async def get_all_transfers(
    status: Optional[str] = None,
    current_user: dict = Depends(check_admin_role)
):
    """Get all key transfer requests (admin only)"""
    return database.get_all_transfer_requests(status)

@router.get("/incoming", response_model=List[KeyTransferResponse])
async def get_incoming_transfers(current_user: dict = Depends(get_current_user)):
    """Get all incoming key transfer requests for the current teacher"""
    # Check if user role exists at 'role' or just 'role'
    user_role = current_user.get("role") or current_user.get("role")
    
    if not user_role or user_role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can view incoming transfers"
        )
    
    return database.get_teacher_incoming_transfers(current_user["id"])

@router.get("/outgoing", response_model=List[KeyTransferResponse])
async def get_outgoing_transfers(current_user: dict = Depends(get_current_user)):
    """Get all outgoing key transfer requests for the current teacher"""
    # Check if user role exists at 'role' or just 'role'
    user_role = current_user.get("role") or current_user.get("role")
    
    if not user_role or user_role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can view outgoing transfers"
        )
    
    return database.get_teacher_outgoing_transfers(current_user["id"])

@router.post("/", response_model=dict)
async def create_transfer(
    transfer: KeyTransferCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new key transfer request"""
    user_role = current_user.get("role")
    user_id = current_user.get("id")

    is_teacher = user_role == "teacher"
    is_admin = user_role == "admin"

    # Разрешаем только teacher или admin
    if not (is_teacher or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create transfer requests"
        )

    # Если не админ, то можно создавать ТОЛЬКО от своего имени
    if not is_admin and transfer.from_teacher_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create transfers for your own keys"
        )

    try:
        result = database.create_transfer_request(transfer.dict())
        # Проверяем, что result не None и имеет ключ transfer_id
        if result and "transfer_id" in result:
            return {"id": result["transfer_id"], "message": "Transfer request created successfully"}
        else:
            # Если результат некорректный, возвращаем безопасный ответ
            return {"message": "Transfer request processed, but ID could not be retrieved"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{transfer_id}/approve", response_model=dict)
async def approve_transfer(
    transfer_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Approve a key transfer request"""
    # First get the transfer details to check permissions
    transfers = database.get_all_transfer_requests("pending")
    transfer = next((t for t in transfers if t["id"] == transfer_id), None)
    
    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pending transfer with ID {transfer_id} not found"
        )
    
    # Check if user role exists at 'role' or just 'role'
    user_role = current_user.get("role") or current_user.get("role")
    is_admin = user_role == "admin"
    
    # Check if the user is the target of the transfer or an admin
    if transfer["to_teacher_id"] != current_user["id"] and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the receiving teacher or an admin can approve this transfer"
        )
    
    try:
        database.approve_transfer_request(transfer_id)
        return {"message": "Transfer request approved successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{transfer_id}/reject", response_model=dict)
async def reject_transfer(
    transfer_id: int,
    reason: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Reject a key transfer request"""
    # First get the transfer details to check permissions
    transfers = database.get_all_transfer_requests("pending")
    transfer = next((t for t in transfers if t["id"] == transfer_id), None)
    
    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pending transfer with ID {transfer_id} not found"
        )
    
    # Check if user role exists at 'role' or just 'role'
    user_role = current_user.get("role") or current_user.get("role")
    is_admin = user_role == "admin"
    
    # Check if the user is the target of the transfer or an admin
    if transfer["to_teacher_id"] != current_user["id"] and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the receiving teacher or an admin can reject this transfer"
        )
    
    try:
        database.reject_transfer_request(transfer_id, reason)
        return {"message": "Transfer request rejected successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{transfer_id}/cancel", response_model=dict)
async def cancel_transfer(
    transfer_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a key transfer request (by the initiating teacher)"""
    # First get the transfer details to check permissions
    transfers = database.get_all_transfer_requests("pending")
    transfer = next((t for t in transfers if t["id"] == transfer_id), None)
    
    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pending transfer with ID {transfer_id} not found"
        )
    
    # Check if user role exists at 'role' or just 'role'
    user_role = current_user.get("role") or current_user.get("role")
    is_admin = user_role == "admin"
    
    # Check if the user is the initiator of the transfer or an admin
    if transfer["from_teacher_id"] != current_user["id"] and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the sending teacher or an admin can cancel this transfer"
        )
    
    try:
        database.cancel_transfer_request(transfer_id)
        return {"message": "Transfer request cancelled successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )