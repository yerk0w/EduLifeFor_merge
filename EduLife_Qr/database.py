import sqlite3
import os
from datetime import datetime

db_path = os.path.join(os.path.dirname(__file__), "database.db")

def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS SESSION_DATA (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_time TIMESTAMP NOT NULL,
            subject_id INTEGER,
            shift_id INTEGER,
            teacher_id INTEGER,
            day_of_week INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()

def close_db_connection(conn):
    conn.close()


def add_user(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, password)  # In production, hash the password!
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()

def get_user_sessions(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT * FROM SESSION_DATA WHERE user_id = ? ORDER BY session_time DESC",
            (user_id,)
        )
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_session_stats(start_date=None, end_date=None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            subject_id,
            shift_id,
            teacher_id,
            day_of_week,
            COUNT(*) as attendance_count,
            MAX(created_at) as created_at,
            MAX(session_time) as session_time
        FROM SESSION_DATA
        WHERE 1=1
    """

    params = []
    if start_date:
        # Преобразование даты из формата DD.MM.YYYY в ISO формат YYYY-MM-DD
        try:
            # Разбиваем строку даты по точкам и переставляем части
            day, month, year = start_date.split('.')
            formatted_start_date = f"{year}-{month}-{day} 00:00:00"
            query += " AND session_time >= ?"
            params.append(formatted_start_date)
        except ValueError:
            # Если дата уже в подходящем формате или формат неверный, 
            # используем как есть (SQLite вернет пустой результат при несоответствии)
            query += " AND session_time >= ?"
            params.append(start_date)

    if end_date:
        # Преобразование даты из формата DD.MM.YYYY в ISO формат YYYY-MM-DD
        try:
            day, month, year = end_date.split('.')
            formatted_end_date = f"{year}-{month}-{day} 23:59:59"
            query += " AND session_time <= ?"
            params.append(formatted_end_date)
        except ValueError:
            query += " AND session_time <= ?"
            params.append(end_date)

    query += """
        GROUP BY subject_id, shift_id, teacher_id, day_of_week
        ORDER BY attendance_count DESC
    """

    try:
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()