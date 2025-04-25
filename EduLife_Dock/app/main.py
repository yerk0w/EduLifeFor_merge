# app/main.py
# Update main.py to ensure we're properly serving static files for uploads

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from pathlib import Path

from app.db.database import engine
from app.models import document, user, registration_request, template
from app.routes import router

# Create directories for static files and templates
STATIC_DIR = Path("app/static")
TEMPLATES_DIR = Path("app/static/templates")
UPLOADS_DIR = Path("app/static/uploads")  # Add directory for document uploads
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)  # Create uploads directory

# Create database tables
document.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)
registration_request.Base.metadata.create_all(bind=engine)
template.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Document Service API",
    description="API для микросервиса документооборота с поддержкой ролей",
    version="0.3.0",  # Updated version
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include routes
app.include_router(router)

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8100"))
    uvicorn.run(app, host="0.0.0.0", port=port)