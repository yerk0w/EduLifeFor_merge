import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from pathlib import Path

from app.db.database import engine
from app.models import document, user, registration_request, template
from app.routes import router
from app.config import STATIC_DIR, TEMPLATES_DIR, UPLOADS_DIR, ALLOW_ORIGINS

# Настройка логгера
logger = logging.getLogger(__name__)

# Create database tables
document.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)
registration_request.Base.metadata.create_all(bind=engine)
template.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Document Service API",
    description="API для микросервиса документооборота с поддержкой ролей",
    version="0.3.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include routes
app.include_router(router)

# Обработчик ошибок валидации
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": [{"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in exc.errors()]},
    )

@app.get("/", response_class=HTMLResponse)
def read_root():
    """
    Redirect to static page
    """
    return RedirectResponse(url="/static/index.html")

@app.get("/health")
def health_check():
    """
    Health check for service
    """
    return {
        "status": "ok",
        "service": "document_service",
        "version": "0.3.0"
    }

# Обработчик статус-кода 404 для неопределенных маршрутов
@app.get("/{path:path}", status_code=status.HTTP_404_NOT_FOUND)
async def catch_all(path: str):
    return {"detail": "Route not found"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8100"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")