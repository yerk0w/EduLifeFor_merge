# app/routes/document.py

from fastapi import Form, File, UploadFile
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.document import DocumentCreate, DocumentResponse, DocumentUpdate
from app.services.document import (
    get_documents, get_document, get_user_documents, create_document,
    update_document_status
)
from app.security.jwt import get_current_active_user, get_admin_user, get_current_user, oauth2_scheme
from app.auth_integration import oauth2_scheme
from app.models.user import User
from app.services.document import create_document_with_file
from app.auth import  get_current_user_from_auth


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
    return create_document(db=db, document=document, user_id=user_id)

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невозможно определить пользователя"
        )
    
    if user_role == "admin":
        documents = get_documents(db, skip=skip, limit=limit)
    else:
        documents = get_user_documents(db, user_id=user_id, skip=skip, limit=limit)
    
    # Добавляем имя автора для каждого документа
    for doc in documents:
        doc.author_name = doc.author.full_name if doc.author else "Неизвестный автор"
    
    return documents

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
    documents = get_documents(db, skip=skip, limit=limit)
    
    # Добавляем имя автора для каждого документа
    for doc in documents:
        doc.author_name = doc.author.full_name if doc.author else "Неизвестный автор"
    
    return documents

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невозможно определить пользователя"
        )
    
    db_document = get_document(db, document_id=document_id)
    if db_document is None:
        raise HTTPException(status_code=404, detail="Документ не найден")
    
    # Проверяем права доступа (админ или автор документа)
    if user_role != "admin" and db_document.author_id != user_id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому документу")
    
    # Добавляем имя автора
    db_document.author_name = db_document.author.full_name if db_document.author else "Неизвестный автор"
    
    return db_document

@router.patch("/{document_id}/review", response_model=DocumentResponse)
async def review_document(
    document_id: int, 
    document_update: DocumentUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    """
    Изменение статуса документа (только для администраторов)
    """
    db_document = update_document_status(db, document_id=document_id, document_update=document_update)
    if db_document is None:
        raise HTTPException(status_code=404, detail="Документ не найден")
    
    # Добавляем имя автора
    db_document.author_name = db_document.author.full_name if db_document.author else "Неизвестный автор"
    
    return db_document

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    title: str = Form(...),
    content: str = Form(...),
    template_type: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a document with a file
    """
    return await create_document_with_file(
        db=db,
        title=title,
        content=content,
        file=file,
        user_id=current_user.id,
        template_type=template_type
    )

# Also, add an endpoint to download document files
@router.get("/{document_id}/download")
async def download_document(
    document_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Download a document's file
    """
    document = get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Документ не найден")
    
    # Check access rights (admin or author)
    if current_user.role != "админ" and document.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому документу")
    
    if not document.file_path:
        raise HTTPException(status_code=404, detail="Файл документа не найден")
    
    # Return file path for serving
    # The file should be served from static directory by FastAPI StaticFiles mount
    return {"file_path": document.file_path}