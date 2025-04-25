# app/models/user.py

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Может быть NULL для пользователей из auth-сервиса
    role = Column(
        Enum("студент", "преподаватель", "админ", name="role_enum"),
        default="студент",
    )
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Дополнительная информация из auth-сервиса
    auth_id = Column(Integer, nullable=True)  # ID пользователя в auth-сервисе
    telegram = Column(String(100), nullable=True)
    phone_number = Column(String(20), nullable=True)
    faculty_name = Column(String(100), nullable=True)
    group_name = Column(String(50), nullable=True)
    department_name = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)  # Для преподавателей
    
    # Связи с документами
    documents = relationship("Document", back_populates="author")