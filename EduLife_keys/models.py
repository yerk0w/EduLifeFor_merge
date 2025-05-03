from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Key models
class KeyBase(BaseModel):
    key_code: str = Field(..., description="Unique code for the key")
    room_number: str = Field(..., description="Room number that the key is for")
    building: Optional[str] = Field(None, description="Building name")
    floor: Optional[int] = Field(None, description="Floor number")
    description: Optional[str] = Field(None, description="Additional description of the room or key")

class KeyCreate(KeyBase):
    teacher_id: Optional[int] = Field(None, description="ID of the teacher to initially assign the key to")

class KeyUpdate(BaseModel):
    key_code: Optional[str] = Field(None, description="Unique code for the key")
    room_number: Optional[str] = Field(None, description="Room number that the key is for")
    building: Optional[str] = Field(None, description="Building name")
    floor: Optional[int] = Field(None, description="Floor number")
    description: Optional[str] = Field(None, description="Additional description of the room or key")

class KeyResponse(KeyBase):
    id: int
    teacher_id: Optional[int] = Field(None, description="ID of the teacher currently assigned to the key")
    assigned_at: Optional[datetime] = Field(None, description="When the key was assigned to the current teacher")
    is_active: Optional[bool] = Field(None, description="Whether the key assignment is active")

    class Config:
        orm_mode = True

# Key Transfer models
class KeyTransferBase(BaseModel):
    key_id: int = Field(..., description="ID of the key being transferred")
    from_teacher_id: int = Field(..., description="ID of the teacher transferring the key")
    to_teacher_id: int = Field(..., description="ID of the teacher receiving the key")
    notes: Optional[str] = Field(None, description="Additional notes about the transfer")

class KeyTransferCreate(KeyTransferBase):
    pass

class KeyTransferUpdate(BaseModel):
    status: str = Field(..., description="Status of the transfer (approved, rejected, cancelled)")
    reason: Optional[str] = Field(None, description="Reason for rejection or cancellation")

class KeyTransferResponse(KeyTransferBase):
    id: int
    status: str = Field(..., description="Status of the transfer (pending, approved, rejected, cancelled)")
    requested_at: datetime
    completed_at: Optional[datetime] = None
    key_code: str = Field(..., description="Code of the key being transferred")
    room_number: str = Field(..., description="Room number for the key")
    building: Optional[str] = Field(None, description="Building name")

    class Config:
        orm_mode = True

# Key History models
class KeyHistoryEntry(BaseModel):
    id: int
    key_id: int
    from_teacher_id: Optional[int] = None
    to_teacher_id: int
    action: str
    timestamp: datetime
    notes: Optional[str] = None
    key_code: Optional[str] = None
    room_number: Optional[str] = None
    building: Optional[str] = None

    class Config:
        orm_mode = True

# Dashboard models
class DashboardStats(BaseModel):
    total_keys: int
    assigned_keys: int
    unassigned_keys: int
    pending_transfers: int
    recent_transfers: List[KeyTransferResponse]

# Teacher Key Summary
class TeacherKeySummary(BaseModel):
    teacher_id: int
    keys_count: int
    keys: List[KeyResponse]
    incoming_requests: List[KeyTransferResponse]
    outgoing_requests: List[KeyTransferResponse]