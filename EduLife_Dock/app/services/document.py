from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate

def get_documents(db: Session, skip: int = 0, limit: int = 100):
    """
    Получение всех документов
    """
    return db.query(Document).order_by(desc(Document.created_at)).offset(skip).limit(limit).all()

def get_document(db: Session, document_id: int):
    """
    Получение документа по ID
    """
    return db.query(Document).filter(Document.id == document_id).first()

def get_user_documents(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Получение документов пользователя
    """
    return db.query(Document).filter(Document.author_id == user_id).order_by(desc(Document.created_at)).offset(skip).limit(limit).all()

def create_document(db: Session, document: DocumentCreate, user_id: int):
    """
    Создание нового документа
    """
    db_document = Document(
        title=document.title,
        content=document.content,
        author_id=user_id,
        template_type=document.template_type
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return db_document

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

def get_documents_by_filter(db: Session, filters: dict, skip: int = 0, limit: int = 100):
    """
    Получение документов с применением фильтров
    
    Поддерживаемые фильтры:
    - author_id: ID автора
    - status: Статус документа
    - template_type: Тип шаблона
    - faculty_name: Название факультета пользователя
    - department_name: Название кафедры преподавателя
    - group_name: Название группы студента
    """
    query = db.query(Document).join(User, Document.author_id == User.id)
    
    # Фильтрация по пользователю
    if "author_id" in filters:
        query = query.filter(Document.author_id == filters["author_id"])
    
    # Фильтрация по статусу
    if "status" in filters:
        query = query.filter(Document.status == filters["status"])
    
    # Фильтрация по типу шаблона
    if "template_type" in filters:
        query = query.filter(Document.template_type == filters["template_type"])
    
    # Фильтрация по факультету
    if "faculty_name" in filters:
        query = query.filter(User.faculty_name == filters["faculty_name"])
    
    # Фильтрация по кафедре
    if "department_name" in filters:
        query = query.filter(User.department_name == filters["department_name"])
    
    # Фильтрация по группе
    if "group_name" in filters:
        query = query.filter(User.group_name == filters["group_name"])
    
    # Сортировка и пагинация
    return query.order_by(desc(Document.created_at)).offset(skip).limit(limit).all()

def get_documents_stats(db: Session):
    """
    Получение статистики по документам
    
    Возвращает:
    - Общее количество документов
    - Количество документов по статусам
    - Количество документов по типам шаблонов
    - Количество документов по факультетам
    """
    total_documents = db.query(Document).count()
    
    # Статистика по статусам
    status_stats = db.query(
        Document.status, 
        db.func.count(Document.id).label('count')
    ).group_by(Document.status).all()
    
    # Статистика по типам шаблонов
    template_stats = db.query(
        Document.template_type, 
        db.func.count(Document.id).label('count')
    ).filter(Document.template_type != None).group_by(Document.template_type).all()
    
    # Статистика по факультетам
    faculty_stats = db.query(
        User.faculty_name, 
        db.func.count(Document.id).label('count')
    ).join(User, Document.author_id == User.id).filter(
        User.faculty_name != None
    ).group_by(User.faculty_name).all()
    
    return {
        "total": total_documents,
        "by_status": {status: count for status, count in status_stats},
        "by_template": {template_type: count for template_type, count in template_stats if template_type},
        "by_faculty": {faculty: count for faculty, count in faculty_stats if faculty}
    }