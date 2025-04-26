# app/__init__.py

import logging
from app.config import LOG_LEVEL, LOG_FORMAT

# Настройка логирования
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT
)

# Импортируем модули для корректной инициализации
from . import models
from . import services
from . import routes
from . import auth
from . import main

# Версия приложения
__version__ = "0.2.0"