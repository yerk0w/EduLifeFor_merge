import sqlite3
import os

# Пути к базам данных
MAIN_DB_PATH = os.path.join(os.path.dirname(__file__), "main_database.db")
SCHEDULE_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "EduLife_raspis", "seconddata.db")

def get_db_connection(db_path):
    """Создает соединение с базой данных и возвращает его"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_user_group(user_id):
    """Получает группу пользователя из main_database.db"""
    try:
        conn = get_db_connection(MAIN_DB_PATH)
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
        conn = get_db_connection(MAIN_DB_PATH)
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

def get_schedule_for_group(group_id):
    """Получает расписание для группы из seconddata.db"""
    try:
        conn = get_db_connection(SCHEDULE_DB_PATH)
        cursor = conn.cursor()
        
        query = """
            SELECT
                s.id, s.date, s.time_start, s.time_end,
                s.subject_id, subj.name as subject_name,
                s.teacher_id, s.group_id,
                s.classroom_id, c.name as classroom_name,
                s.lesson_type_id, lt.name as lesson_type
            FROM schedule s
            JOIN subjects subj ON s.subject_id = subj.id
            JOIN classrooms c ON s.classroom_id = c.id
            JOIN lesson_types lt ON s.lesson_type_id = lt.id
            WHERE s.group_id = ?
            ORDER BY s.date, s.time_start
        """
        
        cursor.execute(query, (group_id,))
        result = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return result
    except Exception as e:
        print(f"Ошибка при получении расписания для группы: {e}")
        return []

def get_schedule_for_teacher(teacher_id):
    """Получает расписание для преподавателя из seconddata.db"""
    try:
        conn = get_db_connection(SCHEDULE_DB_PATH)
        cursor = conn.cursor()
        
        query = """
            SELECT
                s.id, s.date, s.time_start, s.time_end,
                s.subject_id, subj.name as subject_name,
                s.teacher_id, s.group_id,
                s.classroom_id, c.name as classroom_name,
                s.lesson_type_id, lt.name as lesson_type
            FROM schedule s
            JOIN subjects subj ON s.subject_id = subj.id
            JOIN classrooms c ON s.classroom_id = c.id
            JOIN lesson_types lt ON s.lesson_type_id = lt.id
            WHERE s.teacher_id = ?
            ORDER BY s.date, s.time_start
        """
        
        cursor.execute(query, (teacher_id,))
        result = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return result
    except Exception as e:
        print(f"Ошибка при получении расписания для преподавателя: {e}")
        return []

def get_teacher_id_by_user_id(user_id):
    """Получает ID преподавателя по ID пользователя"""
    try:
        conn = get_db_connection(MAIN_DB_PATH)
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

def get_departments():
    """Получает список всех кафедр из main_database.db"""
    try:
        conn = get_db_connection(MAIN_DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, faculty_id, head_teacher_id 
            FROM departments
            ORDER BY name
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
        conn = get_db_connection(MAIN_DB_PATH)
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
        conn = get_db_connection(MAIN_DB_PATH)
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
        conn = get_db_connection(MAIN_DB_PATH)
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
        conn = get_db_connection(MAIN_DB_PATH)
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