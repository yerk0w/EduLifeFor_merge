import os
import uuid
import logging
import shutil
from datetime import datetime
from fastapi import UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError

from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate
from app.config import STATIC_DIR, UPLOADS_DIR, DEMO_MODE

# Set up logging
logger = logging.getLogger(__name__)

# Create directory for document uploads if it doesn't exist
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
    Create a new document with an uploaded file
    
    Args:
        db: Database session
        title: Document title
        content: Document description
        file: Uploaded file
        user_id: Author user ID
        template_type: Template type (optional)
        recipient_id: Recipient user ID (optional, for administrators)
    """
    # Check if the user exists
    user = db.query(User).filter(User.id == user_id).first()
    
    # If user doesn't exist, create a new one
    if not user:
        logger.info(f"User with ID {user_id} not found in document database. Creating record.")
        try:
            user = User(
                id=user_id,
                username=f"user_{user_id}",
                email=f"user_{user_id}@example.com",
                full_name=f"User {user_id}",
                role="студент",
                is_active=True
            )
            db.add(user)
            db.flush()  # Flush but don't commit to check
        except IntegrityError as e:
            db.rollback()
            logger.warning(f"Error creating user, possibly already exists: {str(e)}")
            # Try to get the user again
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                # Create object without adding to the database
                user = User(
                    id=user_id,
                    username=f"user_{user_id}", 
                    email=f"user_{user_id}@example.com",
                    full_name=f"User {user_id}",
                    role="студент"
                )
    
    # Check if recipient exists if specified
    recipient = None
    if recipient_id:
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            logger.warning(f"Recipient with ID {recipient_id} not found in database. Creating record.")
            try:
                recipient = User(
                    id=recipient_id,
                    username=f"user_{recipient_id}",
                    email=f"user_{recipient_id}@example.com",
                    full_name=f"User {recipient_id}",
                    role="студент",
                    is_active=True
                )
                db.add(recipient)
                db.flush()  # Flush but don't commit to check
            except IntegrityError as e:
                db.rollback()
                logger.warning(f"Error creating recipient, possibly already exists: {str(e)}")
                # Try to get the recipient again
                recipient = db.query(User).filter(User.id == recipient_id).first()
    
    # Check file format (must be PDF)
    if not file.filename.lower().endswith('.pdf'):
        logger.warning(f"Attempt to upload unsupported file format: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be in PDF format"
        )
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_location = os.path.join(UPLOADS_DIR, unique_filename)
    
    # Save the file
    try:
        logger.info(f"Saving file {file.filename} as {unique_filename}")
        
        # Create file for writing
        with open(file_location, "wb") as buffer:
            # Copy uploaded file content
            shutil.copyfileobj(file.file, buffer)
            
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )
    
    # Create database record
    try:
        logger.info(f"Creating document record in DB: {title} from user {user_id}")
        db_document = Document(
            title=title,
            content=content,
            author_id=user_id,
            recipient_id=recipient_id,  # Can be None
            template_type=template_type,
            file_path=f"/static/uploads/{unique_filename}"
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        # Set author name for response
        db_document.author_name = user.full_name
        
        return db_document
    except Exception as e:
        # If there was an error creating the record in the database, delete the file
        logger.error(f"Error creating record in DB: {str(e)}")
        if os.path.exists(file_location):
            os.remove(file_location)
        
        db.rollback()  # Roll back transaction in case of error
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating document: {str(e)}"
        )

def get_documents(db: Session, skip: int = 0, limit: int = 100):
    """
    Получение всех документов, отсортированных по дате создания (сначала новые)
    """
    return db.query(Document).order_by(desc(Document.created_at)).offset(skip).limit(limit).all()

def get_document(db: Session, document_id: int):
    """
    Получение документа по ID
    """
    return db.query(Document).filter(Document.id == document_id).first()

def get_user_documents(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Получение документов пользователя, отсортированных по дате создания (сначала новые)
    """
    return db.query(Document).filter(Document.author_id == user_id).order_by(desc(Document.created_at)).offset(skip).limit(limit).all()

def create_document(db: Session, document: DocumentCreate, user_id: int):
    """
    Создание нового документа без файла
    """
    # Проверяем существование пользователя
    user = db.query(User).filter(User.id == user_id).first()
    
    # Если пользователь не найден, создаем нового
    if not user:
        logger.info(f"Пользователь с ID {user_id} не найден в базе данных документооборота. Создаем запись.")
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
            logger.warning(f"Ошибка при создании пользователя, возможно уже существует: {str(e)}")
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
    
    # Создаем документ
    try:
        db_document = Document(
            title=document.title,
            content=document.content,
            author_id=user_id,
            template_type=document.template_type
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        # Устанавливаем имя автора для ответа
        db_document.author_name = user.full_name
        
        return db_document
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при создании документа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании документа: {str(e)}"
        )

def update_document_status(db: Session, document_id: int, document_update: DocumentUpdate):
    """
    Обновление статуса документа
    """
    db_document = db.query(Document).filter(Document.id == document_id).first()
    if not db_document:
        return None
    
    db_document.status = document_update.status
    db.commit()
    db.refresh(db_document)
    
    return db_document

def delete_document(db: Session, document_id: int):
    """
    Удаление документа
    """
    db_document = db.query(Document).filter(Document.id == document_id).first()
    if not db_document:
        return False
    
    # Удаляем файл, если он существует
    if db_document.file_path:
        file_path = os.path.join(STATIC_DIR, db_document.file_path.lstrip('/'))
        if os.path.exists(file_path):
            os.remove(file_path)
    
    # Удаляем запись из БД
    db.delete(db_document)
    db.commit()
    
    return True