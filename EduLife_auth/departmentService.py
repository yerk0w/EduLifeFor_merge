import sqlite3
import os
import requests
import json
from typing import List, Dict, Any, Optional

# Пути к базам данных
MAIN_DB_PATH = os.path.join(os.path.dirname(__file__), "main_database.db")
SCHEDULE_API_URL = os.getenv("SCHEDULE_API_URL", "http://localhost:8090")

# Конфигурация
API_TIMEOUT = 1000  # Таймаут для API запросов (секунды)

def get_db_connection():
    """Создает соединение с базой данных и возвращает его"""
    conn = sqlite3.connect(MAIN_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class APIError(Exception):
    """Исключение для ошибок API"""
    def __init__(self, message, status_code=None, details=None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

def make_api_request(
    method: str,
    url: str,
    token: Optional[str] = None,
    data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Выполняет API запрос к другому сервису"""
    headers = {}

    if token:
        # Добавляем 'Bearer ' только если его нет
        if not token.startswith("Bearer "):
            token = f"Bearer {token}"
        headers["Authorization"] = token

    try:
        response = {
            "get": lambda: requests.get(url, headers=headers, params=params, timeout=API_TIMEOUT),
            "post": lambda: requests.post(url, headers=headers, json=data, timeout=API_TIMEOUT),
            "put": lambda: requests.put(url, headers=headers, json=data, timeout=API_TIMEOUT),
            "delete": lambda: requests.delete(url, headers=headers, timeout=API_TIMEOUT)
        }.get(method.lower())

        if response is None:
            raise ValueError(f"Неподдерживаемый метод HTTP: {method}")

        result = response()

        if result.status_code >= 400:
            try:
                details = result.json()
            except Exception:
                details = {"raw": result.text}

            raise APIError(
                f"API вернул ошибку {result.status_code}",
                status_code=result.status_code,
                details=details
            )

        return result.json()

    except requests.RequestException as e:
        raise APIError(f"Ошибка при выполнении API запроса: {str(e)}")

def get_user_group(user_id):
    """Получает группу пользователя из main_database.db"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Сначала проверяем, является ли пользователь студентом
        cursor.execute("""
            SELECT s.group_id, g.name as group_name
            FROM students s
            JOIN groups g ON s.group_id = g.id
            WHERE s.user_id = ?
        """, (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "group_id": result["group_id"],
                "group_name": result["group_name"]
            }
        return None
    except Exception as e:
        print(f"Ошибка при получении группы пользователя: {e}")
        return None

def get_user_department(user_id):
    """Получает кафедру преподавателя из main_database.db"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверяем, является ли пользователь преподавателем
        cursor.execute("""
            SELECT t.department_id, d.name as department_name
            FROM teachers t
            JOIN departments d ON t.department_id = d.id
            WHERE t.user_id = ?
        """, (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "department_id": result["department_id"],
                "department_name": result["department_name"]
            }
        return None
    except Exception as e:
        print(f"Ошибка при получении кафедры пользователя: {e}")
        return None

def get_teacher_id_by_user_id(user_id):
    """Получает ID преподавателя по ID пользователя"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM teachers WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return result["id"]
        return None
    except Exception as e:
        print(f"Ошибка при получении ID преподавателя: {e}")
        return None

def get_schedule_for_group(group_id, token=None):
    """Получает расписание для группы из сервиса расписания"""
    try:
        url = f"{SCHEDULE_API_URL}/schedule?group_id={group_id}"
        return make_api_request(token, url)
    except Exception as e:
        print(f"Ошибка при получении расписания для группы: {e}")
        return []

def get_schedule_for_teacher(teacher_id, token=None):
    """Получает расписание для преподавателя из сервиса расписания"""
    try:
        url = f"{SCHEDULE_API_URL}/schedule/teacher/{teacher_id}"
        return make_api_request(url, token)
    except Exception as e:
        print(f"Ошибка при получении расписания для преподавателя: {e}")
        return []

def get_departments():
    """Получает список всех кафедр из main_database.db"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT d.id, d.name, d.faculty_id, f.name as faculty_name, 
                   d.head_teacher_id, u.full_name as head_teacher_name
            FROM departments d
            JOIN faculties f ON d.faculty_id = f.id
            LEFT JOIN teachers t ON d.head_teacher_id = t.id
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY d.name
        """)
        
        departments = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return departments
    except Exception as e:
        print(f"Ошибка при получении списка кафедр: {e}")
        return []

def get_department_by_id(department_id):
    """Получает информацию о кафедре по ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT d.id, d.name, d.faculty_id, f.name as faculty_name, 
                   d.head_teacher_id, u.full_name as head_teacher_name
            FROM departments d
            JOIN faculties f ON d.faculty_id = f.id
            LEFT JOIN teachers t ON d.head_teacher_id = t.id
            LEFT JOIN users u ON t.user_id = u.id
            WHERE d.id = ?
        """, (department_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return dict(result)
        return None
    except Exception as e:
        print(f"Ошибка при получении информации о кафедре: {e}")
        return None

def create_department(department_data):
    """Создает новую кафедру в main_database.db"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO departments (name, faculty_id, head_teacher_id)
            VALUES (?, ?, ?)
        """, (
            department_data["name"].strip(),
            department_data["faculty_id"],
            department_data.get("head_teacher_id")
        ))
        
        department_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return department_id
    except sqlite3.IntegrityError as e:
        print(f"Ошибка целостности данных: {e}")
        return None
    except Exception as e:
        print(f"Ошибка при создании кафедры: {e}")
        return None

def update_department(department_id, department_data):
    """Обновляет информацию о кафедре в main_database.db"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        update_fields = []
        update_values = []
        
        for field, value in department_data.items():
            if field in ["name", "faculty_id", "head_teacher_id"]:
                update_fields.append(f"{field} = ?")
                update_values.append(value)
        
        if not update_fields:
            conn.close()
            return department_id
        
        update_values.append(department_id)
        
        cursor.execute(f"""
            UPDATE departments 
            SET {', '.join(update_fields)}
            WHERE id = ?
        """, update_values)
        
        conn.commit()
        conn.close()
        
        return department_id
    except sqlite3.IntegrityError as e:
        print(f"Ошибка целостности данных: {e}")
        return None
    except Exception as e:
        print(f"Ошибка при обновлении кафедры: {e}")
        return None

def delete_department(department_id):
    """Удаляет кафедру из main_database.db"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверяем, есть ли связанные преподаватели
        cursor.execute("SELECT COUNT(*) FROM teachers WHERE department_id = ?", (department_id,))
        if cursor.fetchone()[0] > 0:
            conn.close()
            raise ValueError("Невозможно удалить кафедру, к которой привязаны преподаватели")
        
        cursor.execute("DELETE FROM departments WHERE id = ?", (department_id,))
        conn.commit()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Ошибка при удалении кафедры: {e}")
        return False
    
def get_student_schedule(department_id, token=None):
    """Получает расписание для студентов кафедры из сервиса расписания"""
    try:
        url = f"{SCHEDULE_API_URL}/schedule?department_id={department_id}"
        return make_api_request(url, token)
    except Exception as e:
        print(f"Ошибка при получении расписания для студентов кафедры: {e}")
        return []