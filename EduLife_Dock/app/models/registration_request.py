from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class RegistrationRequest(Base):
    __tablename__ = "registration_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requested_role = Column(
        Enum("студент", "преподаватель", name="role_request_enum"),
        default="студент",
    )
    status = Column(
        Enum("ожидает", "одобрено", "отклонено", name="request_status_enum"),
        default="ожидает",
    )
    comment = Column(Text, nullable=True)  # Комментарий администратора при отклонении
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)  # Время обработки заявки
    
    # Связь с пользователем
    user = relationship("User", back_populates="registration_requests")