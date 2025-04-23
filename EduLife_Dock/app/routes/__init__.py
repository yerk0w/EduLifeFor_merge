from fastapi import APIRouter
from .document import router as document_router
from .registration_request import router as registration_request_router
from .template import router as template_router

router = APIRouter()
router.include_router(registration_request_router)
router.include_router(template_router)
router.include_router(document_router)

__all__ = ["router"]