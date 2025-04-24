import sqlite3
import sys
import os

# Путь к базе данных SQLite
DB_PATH = "main_database.db"  # замените на нужный путь

def get_faculties():
    """Получить список факультетов"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name FROM faculties ORDER BY name")
            faculties = cursor.fetchall()
            return faculties
    except sqlite3.Error as e:
        print(f"Ошибка при получении списка факультетов: {e}")
        return []

def get_teachers():
    """Получить список преподавателей"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT t.id, u.full_name, d.name as current_department
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                JOIN departments d ON t.department_id = d.id
                ORDER BY u.full_name
            """)
            teachers = cursor.fetchall()
            return teachers
    except sqlite3.Error as e:
        print(f"Ошибка при получении списка преподавателей: {e}")
        return []

def add_department():
    """Добавить новую кафедру"""
    print("\n=== Добавление новой кафедры ===")

    # Получаем список факультетов
    faculties = get_faculties()
    if not faculties:
        print("Нет доступных факультетов. Сначала создайте факультет.")
        return
    
    # Выводим список факультетов
    print("\nДоступные факультеты:")
    for idx, faculty in enumerate(faculties, 1):
        print(f"{idx}. {faculty[1]} (ID: {faculty[0]})")
    
    # Запрашиваем название кафедры
    name = input("\nВведите название кафедры: ")
    if not name.strip():
        print("Название кафедры не может быть пустым.")
        return
    
    # Запрашиваем ID факультета
    try:
        faculty_choice = input("Выберите номер факультета из списка: ")
        if not faculty_choice.strip():
            print("Выбор факультета обязателен.")
            return
        
        faculty_idx = int(faculty_choice) - 1
        if faculty_idx < 0 or faculty_idx >= len(faculties):
            print("Некорректный выбор факультета.")
            return
        
        faculty_id = faculties[faculty_idx][0]
    except ValueError:
        print("Введите корректный номер факультета.")
        return
    
    # Получаем список преподавателей для выбора заведующего кафедрой
    teachers = get_teachers()
    if teachers:
        print("\nДоступные преподаватели (для должности заведующего кафедрой):")
        for idx, teacher in enumerate(teachers, 1):
            print(f"{idx}. {teacher[1]} - Кафедра: {teacher[2]} (ID: {teacher[0]})")
        
        # Запрашиваем ID заведующего кафедрой
        head_teacher_choice = input("\nВыберите номер заведующего кафедрой (оставьте пустым, если не требуется): ")
        
        if head_teacher_choice.strip():
            try:
                teacher_idx = int(head_teacher_choice) - 1
                if teacher_idx < 0 or teacher_idx >= len(teachers):
                    print("Некорректный выбор преподавателя. Заведующий не будет назначен.")
                    head_teacher_id = None
                else:
                    head_teacher_id = teachers[teacher_idx][0]
            except ValueError:
                print("Введите корректный номер преподавателя. Заведующий не будет назначен.")
                head_teacher_id = None
        else:
            head_teacher_id = None
    else:
        print("\nНет доступных преподавателей для выбора заведующего кафедрой.")
        head_teacher_id = None

    # Подтверждение создания
    print("\nДанные для создания кафедры:")
    print(f"Название: {name}")
    print(f"Факультет: {faculties[faculty_idx][1]}")
    print(f"Заведующий: {teachers[teacher_idx][1] if head_teacher_id else 'Не назначен'}")
    
    confirm = input("\nСоздать кафедру? (y/n): ")
    if confirm.lower() != 'y':
        print("Операция отменена.")
        return

    # Добавляем кафедру в базу данных
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO departments (name, faculty_id, head_teacher_id)
                VALUES (?, ?, ?)
            """, (
                name.strip(),
                faculty_id,
                head_teacher_id
            ))
            conn.commit()
            print(f"\nКафедра '{name}' успешно добавлена.")
    except sqlite3.IntegrityError as e:
        print(f"Ошибка целостности данных: {e}")
    except Exception as e:
        print(f"Ошибка при добавлении: {e}")

def list_departments():
    """Вывести список всех кафедр"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT d.id, d.name, f.name AS faculty_name, 
                       CASE WHEN t.id IS NOT NULL THEN u.full_name ELSE 'Не назначен' END AS head_teacher
                FROM departments d
                JOIN faculties f ON d.faculty_id = f.id
                LEFT JOIN teachers t ON d.head_teacher_id = t.id
                LEFT JOIN users u ON t.user_id = u.id
                ORDER BY d.name
            """)
            departments = cursor.fetchall()
            
            if not departments:
                print("\nНет доступных кафедр.")
                return
            
            print("\n=== Список кафедр ===")
            print(f"{'ID':<5} {'Название':<30} {'Факультет':<20} {'Заведующий':<30}")
            print("-" * 85)
            
            for dept in departments:
                print(f"{dept[0]:<5} {dept[1]:<30} {dept[2]:<20} {dept[3]:<30}")
                
    except sqlite3.Error as e:
        print(f"Ошибка при получении списка кафедр: {e}")

if __name__ == "__main__":
    # Проверка существования базы данных
    if not os.path.exists(DB_PATH):
        print(f"Ошибка: Файл базы данных '{DB_PATH}' не найден.")
        sys.exit(1)
