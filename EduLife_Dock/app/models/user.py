from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)  # Обратите внимание на удаление index=True для совместимости
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Может быть NULL для пользователей из auth-сервиса
    role = Column(
        Enum("студент", "преподаватель", "админ", name="role_enum"),
        default="студент",
    )
    is_active = Column(Boolean, default=True)  # Изменено значение по умолчанию на True для автосоздания
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
    documents = relationship("Document", back_populates="author", cascade="all, delete-orphan")
    registration_requests = relationship("RegistrationRequest", back_populates="user")
    created_documents = relationship("Document", foreign_keys='Document.creator_id', back_populates="creator")
    received_documents = relationship("Document", foreign_keys='Document.recipient_id', back_populates="recipient")

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
import logging


# Create a directory for document uploads
UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


async def create_document_with_file(
    db: Session, 
    title: str,
    content: str,
    file: UploadFile,
    user_id: int,
    template_type: str = None,
    recipient_id: int = None
):
    """
    Создание нового документа с загруженным файлом
    
    Args:
        db: Сессия базы данных
        title: Название документа
        content: Описание документа
        file: Загруженный файл
        user_id: ID автора документа
        template_type: Тип шаблона (опционально)
        recipient_id: ID получателя документа (опционально, для администраторов)
    """
    # Проверяем существование пользователя
    user = db.query(User).filter(User.id == user_id).first()
    
    # Если пользователь не найден, создаем нового
    if not user:
        print(f"Пользователь с ID {user_id} не найден в базе данных документооборота. Создаем запись.")
        try:
            user = User(
                id=user_id,
                username=f"user_{user_id}",
                email=f"user_{user_id}@example.com",
                full_name=f"Пользователь {user_id}",
                role="студент",
                is_active=True
            )
            db.add(user)
            db.flush()  # Flush, но не commit для проверки
        except IntegrityError as e:
            db.rollback()
            print(f"Ошибка при создании пользователя, возможно уже существует: {str(e)}")
            # Повторно пытаемся получить пользователя
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                # Создаем объект без добавления в БД
                user = User(
                    id=user_id,
                    username=f"user_{user_id}", 
                    email=f"user_{user_id}@example.com",
                    full_name=f"Пользователь {user_id}",
                    role="студент"
                )
    
    # Проверяем существование получателя, если указан
    recipient = None
    if recipient_id:
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            print(f"Получатель с ID {recipient_id} не найден в базе данных. Создаем запись.")
            try:
                recipient = User(
                    id=recipient_id,
                    username=f"user_{recipient_id}",
                    email=f"user_{recipient_id}@example.com",
                    full_name=f"Пользователь {recipient_id}",
                    role="студент",
                    is_active=True
                )
                db.add(recipient)
                db.flush()  # Flush, но не commit для проверки
            except IntegrityError as e:
                db.rollback()
                print(f"Ошибка при создании получателя, возможно уже существует: {str(e)}")
                # Повторно пытаемся получить получателя
                recipient = db.query(User).filter(User.id == recipient_id).first()
    
    # Проверяем формат файла (должен быть PDF)
    if not file.filename.lower().endswith('.pdf'):
        print(f"Попытка загрузить файл неподдерживаемого формата: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл должен быть в формате PDF"
        )
    
    # Генерируем уникальное имя файла
    file_ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_location = os.path.join(UPLOADS_DIR, unique_filename)
    
    # Сохраняем файл
    try:
        print(f"Сохранение файла {file.filename} как {unique_filename}")
        
        # Создаем файл для записи
        with open(file_location, "wb") as buffer:
            # Копируем содержимое загруженного файла
            shutil.copyfileobj(file.file, buffer)
            
    except Exception as e:
        print(f"Ошибка при сохранении файла: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при сохранении файла: {str(e)}"
        )
    
    # Создаем запись в базе данных
    try:
        print(f"Создание записи документа в БД: {title} от пользователя {user_id}")
        db_document = Document(
            title=title,
            content=content,
            author_id=user_id,
            recipient_id=recipient_id,  # Может быть None
            template_type=template_type,
            file_path=f"/static/uploads/{unique_filename}"
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        # Устанавливаем имя авт
        db_document.author_name = user.full_name
        
        return db_document
    except Exception as e:
        # Если произошла ошибка при создании записи в БД, удаляем файл
        print(f"Ошибка при создании записи в БД: {str(e)}")
        if os.path.exists(file_location):
            os.remove(file_location)
        
        db.rollback()  # Откатываем транзакцию в случае ошибки
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании документа: {str(e)}"
        )