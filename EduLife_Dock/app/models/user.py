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
    
    # Связи с другими таблицами
    documents = relationship("Document", back_populates="author")
    registration_requests = relationship("RegistrationRequest", back_populates="user")
    
    
    # app/services/document.py
# Add this implementation to handle file uploads

from fastapi import UploadFile, File, Form, HTTPException, status
import os
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
import shutil

from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate
from app.config import STATIC_DIR

# Create a directory for document uploads
UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

async def create_document_with_file(
    db: Session, 
    title: str,
    content: str,
    file: UploadFile,
    user_id: int,
    template_type: str = None
):
    """
    Create a new document with an uploaded file
    """
    # Validate user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Validate file is PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл должен быть в формате PDF"
        )
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_location = os.path.join(UPLOADS_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при сохранении файла: {str(e)}"
        )
    
    # Create database record
    db_document = Document(
        title=title,
        content=content,
        author_id=user_id,
        template_type=template_type,
        file_path=f"/static/uploads/{unique_filename}"
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Set author_name for response
    db_document.author_name = user.full_name
    
    return db_document