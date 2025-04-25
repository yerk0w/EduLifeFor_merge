import logging
from fastapi import Form, File, UploadFile
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import desc

from app.db.database import get_db
from app.schemas.document import DocumentCreate, DocumentResponse, DocumentUpdate
from app.services.document import (
    get_documents, get_document, get_user_documents, create_document,
    update_document_status, create_document_with_file
)
from app.models.user import User
from app.auth import get_current_user_from_auth, get_admin_user, get_teacher_user
from app.config import DEMO_MODE

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document_route(
    document: DocumentCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_auth)
):
    """
    Создание нового документа
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невозможно определить пользователя"
        )
    try:
        return create_document(db=db, document=document, user_id=user_id)
    except Exception as e:
        logger.error(f"Ошибка при создании документа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании документа: {str(e)}"
        )

@router.get("/", response_model=List[DocumentResponse])
async def read_documents(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_auth)
):
    """
    Получение всех документов (для администраторов) или документов пользователя
    """
    user_id = current_user.get("id")
    user_role = current_user.get("role", "").lower()
    
    if not user_id:
        if DEMO_MODE:
            # В демо-режиме присваиваем ID=1
            user_id = 1
            user_role = "студент"
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Невозможно определить пользователя"
            )
    
    try:
        if user_role in ["admin", "админ"]:
            documents = get_documents(db, skip=skip, limit=limit)
        else:
            documents = get_user_documents(db, user_id=user_id, skip=skip, limit=limit)
        
        # Добавляем имя автора для каждого документа
        for doc in documents:
            doc.author_name = doc.author.full_name if doc.author and hasattr(doc.author, 'full_name') else "Неизвестный автор"
        
        return documents
    except Exception as e:
        logger.error(f"Ошибка при получении документов: {str(e)}")
        # В случае ошибки возвращаем пустой список вместо ошибки
        return []

@router.get("/all", response_model=List[DocumentResponse])
async def read_all_documents(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Получение всех документов (только для администраторов)
    """
    try:
        documents = get_documents(db, skip=skip, limit=limit)
        
        # Добавляем имя автора для каждого документа
        for doc in documents:
            doc.author_name = doc.author.full_name if doc.author and hasattr(doc.author, 'full_name') else "Неизвестный автор"
        
        return documents
    except Exception as e:
        logger.error(f"Ошибка при получении всех документов: {str(e)}")
        # В случае ошибки возвращаем пустой список вместо ошибки
        return []

@router.get("/{document_id}", response_model=DocumentResponse)
async def read_document(
    document_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_auth)
):
    """
    Получение документа по ID
    """
    user_id = current_user.get("id")
    user_role = current_user.get("role", "").lower()
    
    if not user_id:
        if DEMO_MODE:
            # В демо-режиме присваиваем ID=1
            user_id = 1
            user_role = "студент"
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Невозможно определить пользователя"
            )
    
    try:
        db_document = get_document(db, document_id=document_id)
        if db_document is None:
            raise HTTPException(status_code=404, detail="Документ не найден")
        
        # Проверяем права доступа (админ или автор документа)
        if user_role not in ["admin", "админ"] and db_document.author_id != user_id:
            # В демо-режиме не проверяем права доступа
            if not DEMO_MODE:
                raise HTTPException(status_code=403, detail="Нет доступа к этому документу")
        
        # Добавляем имя автора
        db_document.author_name = db_document.author.full_name if db_document.author and hasattr(db_document.author, 'full_name') else "Неизвестный автор"
        
        return db_document
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении документа {document_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении документа: {str(e)}"
        )

@router.patch("/{document_id}/review", response_model=DocumentResponse)
async def review_document(
    document_id: int, 
    document_update: DocumentUpdate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Изменение статуса документа (только для администраторов)
    """
    try:
        db_document = update_document_status(db, document_id=document_id, document_update=document_update)
        if db_document is None:
            raise HTTPException(status_code=404, detail="Документ не найден")
        
        # Добавляем имя автора
        db_document.author_name = db_document.author.full_name if db_document.author and hasattr(db_document.author, 'full_name') else "Неизвестный автор"
        
        # Добавляем фоновую задачу для уведомления автора документа
        # (Можно реализовать в будущем отправку уведомлений или email)
        
        return db_document
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при изменении статуса документа {document_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при изменении статуса документа: {str(e)}"
        )

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    title: str = Form(...),
    content: str = Form(...),
    template_type: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_auth)
):
    """
    Загрузка документа с файлом
    """
    user_id = current_user.get("id")
    if not user_id:
        if DEMO_MODE:
            # В демо-режиме присваиваем ID=1
            user_id = 1
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Невозможно определить пользователя"
            )
    
    try:
        logger.info(f"Загрузка документа: {title} от пользователя {user_id}")
        db_document = await create_document_with_file(
            db=db,
            title=title,
            content=content,
            file=file,
            user_id=user_id,
            template_type=template_type
        )
        
        return db_document
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при загрузке документа: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при загрузке документа: {str(e)}"
        )

@router.get("/{document_id}/download")
async def download_document(
    document_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_auth)
):
    """
    Скачивание файла документа
    """
    user_id = current_user.get("id")
    user_role = current_user.get("role", "").lower()
    
    if not user_id:
        if DEMO_MODE:
            # В демо-режиме присваиваем ID=1
            user_id = 1
            user_role = "студент" 
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Невозможно определить пользователя"
            )
    
    try:
        document = get_document(db, document_id=document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Документ не найден")
        
        # Проверяем права доступа (админ, преподаватель или автор документа)
        if user_role not in ["admin", "админ", "teacher", "преподаватель"] and document.author_id != user_id:
            # В демо-режиме не проверяем права доступа
            if not DEMO_MODE:
                raise HTTPException(status_code=403, detail="Нет доступа к этому документу")
        
        if not document.file_path:
            raise HTTPException(status_code=404, detail="Файл документа не найден")
        
        # Возвращаем путь к файлу для обслуживания через StaticFiles
        return {"file_path": document.file_path}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при скачивании документа {document_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при скачивании документа: {str(e)}"
        )

@router.post("/admin/send", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def admin_send_document(
    title: str = Form(...),
    content: str = Form(...),
    recipient_id: int = Form(...),
    template_type: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Отправка документа студенту (только для администраторов)
    """
    admin_id = current_user.get("id")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невозможно определить администратора"
        )
    
    # Проверяем существование получателя
    recipient = db.query(User).filter(User.id == recipient_id).first()
    if not recipient:
        logger.warning(f"Получатель с ID {recipient_id} не найден")
        
        # В демо-режиме создаем пользователя-получателя
        if DEMO_MODE:
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
                db.commit()
                db.refresh(recipient)
            except Exception as e:
                logger.error(f"Не удалось создать получателя: {str(e)}")
                # Проверяем еще раз после попытки создания
                recipient = db.query(User).filter(User.id == recipient_id).first()
                if not recipient:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Получатель не найден"
                    )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Получатель не найден"
            )
    
    try:
        logger.info(f"Отправка документа: {title} от администратора {admin_id} студенту {recipient_id}")
        db_document = await create_document_with_file(
            db=db,
            title=title,
            content=content,
            file=file,
            user_id=admin_id,  # Автор - администратор
            template_type=template_type,
            recipient_id=recipient_id  # Добавляем получателя
        )
        
        return db_document
    except Exception as e:
        logger.error(f"Ошибка при отправке документа студенту: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при отправке документа: {str(e)}"
        )

@router.get("/admin/received", response_model=List[DocumentResponse])
async def read_admin_documents(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_auth)
):
    """
    Получение документов, отправленных администратором текущему пользователю
    """
    user_id = current_user.get("id")
    if not user_id:
        if DEMO_MODE:
            # В демо-режиме присваиваем ID=1
            user_id = 1
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Невозможно определить пользователя"
            )
    
    try:
        # Получаем документы, где пользователь является получателем
        documents = db.query(Document)\
            .filter(Document.recipient_id == user_id)\
            .order_by(desc(Document.created_at))\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        # Добавляем имя автора для каждого документа
        for doc in documents:
            doc.author_name = doc.author.full_name if doc.author and hasattr(doc.author, 'full_name') else "Администратор"
        
        return documents
    except Exception as e:
        logger.error(f"Ошибка при получении документов от администратора: {str(e)}")
        # В случае ошибки возвращаем пустой список
        return []