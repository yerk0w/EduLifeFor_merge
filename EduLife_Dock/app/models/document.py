from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(
        Enum("ожидает", "одобрено", "отклонено", name="status_enum"),
        default="ожидает",
    )
    
    # Связь с пользователем-автором
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author = relationship("User", foreign_keys=[author_id], back_populates="created_documents")
    
    # Связь с пользователем-получателем (для документов, отправленных администратором)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_documents")
    
    # Тип шаблона (если документ создан на основе шаблона)
    template_type = Column(String(50), nullable=True)
    
    # Путь к файлу документа
    file_path = Column(String(255), nullable=True)

# app/schemas/document.py
# Update the document schema to include file path

from datetime import datetime
from typing import Optional, Literal, Annotated
from pydantic import BaseModel, Field, StringConstraints

class DocumentBase(BaseModel):
    title: Annotated[str, StringConstraints(min_length=1, max_length=100)]
    content: Annotated[str, StringConstraints(min_length=1)]
    template_type: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    status: Literal["ожидает", "одобрено", "отклонено"]

class DocumentResponse(DocumentBase):
    id: int
    created_at: datetime
    status: str
    author_id: int
    author_name: str  # Добавляем имя автора для удобства
    file_path: Optional[str] = None  # Путь к файлу

    class Config:
        from_attributes = True