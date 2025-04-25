# app/config.py

import os
from dotenv import load_dotenv
import logging

# Загружаем переменные окружения из .env файла
load_dotenv()

# Базовые настройки
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./document_service.db")
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", "your-secret-key-for-local-development")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Настройки интеграции с внешними сервисами
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8070")
RASPIS_SERVICE_URL = os.getenv("RASPIS_SERVICE_URL", "http://localhost:8090")
QR_SERVICE_URL = os.getenv("QR_SERVICE_URL", "http://localhost:8080")

# Настройки безопасности
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Настройки логирования
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Пути к файлам
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "app/static")
TEMPLATES_DIR = os.path.join(STATIC_DIR, "templates")

# Конфигурация логирования
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(BASE_DIR, "app.log"))
    ]
)

# Создаем директории, если их нет
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)