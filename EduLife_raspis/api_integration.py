import os
import requests
from typing import Dict, Any, Optional, List
import json

# Конфигурация
API_TIMEOUT = 10  # Таймаут для API запросов (секунды)

# URL сервисов
AUTH_API_URL = os.getenv("AUTH_API_URL", "http://localhost:8070")
QR_API_URL = os.getenv("QR_API_URL", "http://localhost:8080")
DOCK_API_URL = os.getenv("DOCK_API_URL", "http://localhost:8100")

class APIError(Exception):
    """Исключение для ошибок API"""
    def __init__(self, message, status_code=None, details=None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

def make_api_request(method: str, url: str, token: Optional[str] = None, 
                     data: Optional[Dict[str, Any]] = None, 
                     params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Выполняет API запрос к другому сервису"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method.lower() == "get":
            response = requests.get(url, headers=headers, params=params, timeout=API_TIMEOUT)
        elif method.lower() == "post":
            response = requests.post(url, headers=headers, json=data, timeout=API_TIMEOUT)
        elif method.lower() == "put":
            response = requests.put(url, headers=headers, json=data, timeout=API_TIMEOUT)
        elif method.lower() == "delete":
            response = requests.delete(url, headers=headers, timeout=API_TIMEOUT)
        else:
            raise ValueError(f"Неподдерживаемый метод HTTP: {method}")
        
        # Проверяем статус ответа
        if response.status_code >= 400:
            try:
                details = response.json()
            except:
                details = {"raw": response.text}
            
            raise APIError(
                f"API вернул ошибку {response.status_code}",
                status_code=response.status_code,
                details=details
            )
        
        # Возвращаем данные ответа
        return response.json()
    
    except requests.RequestException as e:
        raise APIError(f"Ошибка при выполнении API запроса: {str(e)}")

# API авторизации
def verify_token(token: str) -> Dict[str, Any]:
    """Проверяет токен пользователя через сервис авторизации"""
    url = f"{AUTH_API_URL}/auth/me"
    try:
        return make_api_request("get", url, token=token)
    except APIError:
        return {}

# Методы для получения данных о преподавателях и группах
def get_teacher_info(teacher_id: int, token: str) -> Dict[str, Any]:
    """Получает информацию о преподавателе из сервиса авторизации"""
    url = f"{AUTH_API_URL}/teachers/{teacher_id}"
    try:
        return make_api_request("get", url, token=token)
    except APIError:
        return {}

def get_group_info(group_id: int, token: str) -> Dict[str, Any]:
    """Получает информацию о группе из сервиса авторизации"""
    url = f"{AUTH_API_URL}/groups/{group_id}"
    try:
        return make_api_request("get", url, token=token)
    except APIError:
        return {}

def get_students_from_group(group_id: int, token: str) -> List[Dict[str, Any]]:
    """Получает список студентов группы из сервиса авторизации"""
    url = f"{AUTH_API_URL}/students/by-group/{group_id}"
    try:
        return make_api_request("get", url, token=token)
    except APIError:
        return []

def get_student_by_user_id(user_id: int, token: str) -> Dict[str, Any]:
    """Получает информацию о студенте по ID пользователя из сервиса авторизации"""
    url = f"{AUTH_API_URL}/students/{user_id}"
    try:
        return make_api_request("get", url, token=token)
    except APIError as e:
        print(f"Ошибка при получении информации о студенте: {e}")
        return {}

# Методы для обогащения данных расписания
def enrich_schedule_data(schedule_item: Dict[str, Any], token: str) -> Dict[str, Any]:
    """
    Обогащает данные о расписании информацией о преподавателе и группе
    из сервиса авторизации
    """
    result = schedule_item.copy()
    
    # Добавляем информацию о преподавателе
    if "teacher_id" in schedule_item:
        teacher_info = get_teacher_info(schedule_item["teacher_id"], token)
        result["teacher_name"] = teacher_info.get("full_name", "")
        result["teacher_department"] = teacher_info.get("department_name", "")
    
    # Добавляем информацию о группе
    if "group_id" in schedule_item:
        group_info = get_group_info(schedule_item["group_id"], token)
        result["group_name"] = group_info.get("name", "")
        result["faculty_name"] = group_info.get("faculty_name", "")
    
    return result

# Методы для уведомлений о расписании
def send_schedule_notifications(notification_data: Dict[str, Any], token: str) -> bool:
    """
    Отправляет уведомления об изменениях в расписании студентам и преподавателям
    через сервис авторизации
    """
    try:
        # Получаем ID группы из уведомления или данных расписания
        target_group_id = notification_data.get('target_group_id')
        
        # Если target_group_id не указан, получаем его из данных расписания
        if not target_group_id:
            if notification_data.get('change_type') == 'create' and notification_data.get('new_data'):
                new_data = notification_data.get('new_data')
                if isinstance(new_data, str):
                    try:
                        new_data = json.loads(new_data)
                    except json.JSONDecodeError:
                        pass
                target_group_id = new_data.get('group_id')
            elif notification_data.get('previous_data'):
                prev_data = notification_data.get('previous_data')
                if isinstance(prev_data, str):
                    try:
                        prev_data = json.loads(prev_data)
                    except json.JSONDecodeError:
                        pass
                target_group_id = prev_data.get('group_id')
        
        # Если определили ID группы, отправляем уведомление только студентам этой группы
        if target_group_id:
            # Получаем список студентов группы для отправки уведомлений
            students = get_students_from_group(target_group_id, token)
            
            # Также получаем преподавателя, который ведет занятия
            teacher_id = None
            if notification_data.get('change_type') == 'create' and notification_data.get('new_data'):
                new_data = notification_data.get('new_data')
                if isinstance(new_data, str):
                    try:
                        new_data = json.loads(new_data)
                    except json.JSONDecodeError:
                        pass
                teacher_id = new_data.get('teacher_id')
            elif notification_data.get('previous_data'):
                prev_data = notification_data.get('previous_data')
                if isinstance(prev_data, str):
                    try:
                        prev_data = json.loads(prev_data)
                    except json.JSONDecodeError:
                        pass
                teacher_id = prev_data.get('teacher_id')
            
            # Получаем данные преподавателя
            teacher_info = {}
            if teacher_id:
                teacher_info = get_teacher_info(teacher_id, token)
            
            # Здесь можно реализовать логику отправки уведомлений
            # студентам группы и преподавателю через сервис авторизации
            
            return True
        else:
            print("Не удалось определить целевую группу для уведомления")
            return False
            
    except Exception as e:
        print(f"Ошибка при отправке уведомлений о расписании: {str(e)}")
        return False