import sqlite3
import os
import sys

db_path = os.path.join(os.path.dirname(__file__), "main_database.db")

def setup_database():
    """
    Creates new tables and columns in the database for user profile information.
    """
    print(f"Setting up database at {db_path}...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if the cities table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cities'")
    cities_exists = cursor.fetchone() is not None
    
    if not cities_exists:
        print("Creating cities table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert sample cities
        print("Inserting sample cities...")
        cities = [
            ('Астана',),
            ('Алматы',),
            ('Шымкент',),
            ('Караганда',),
            ('Семей',),
            ('Атырау',),
            ('Костанай',),
            ('Кокшетау',),
        ]
        cursor.executemany("INSERT INTO cities (name) VALUES (?)", cities)
    
    # Check if the colleges table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='colleges'")
    colleges_exists = cursor.fetchone() is not None
    
    if not colleges_exists:
        print("Creating colleges table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS colleges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                city_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (city_id) REFERENCES cities(id)
            )
        """)
        
        # Get id of Astana city
        cursor.execute("SELECT id FROM cities WHERE name = ?", ("Астана",))
        astana_id_row = cursor.fetchone()
        if astana_id_row:
            astana_id = astana_id_row[0]
        else:
            raise ValueError("Город 'Астана' не найден в таблице cities.")
        
        # Insert sample colleges with Astana city_id
        print("Inserting sample colleges...")
        colleges = [
            ('Колледж AITU', astana_id),
            ('ТОО «Казахстанский Швейцарско-Американский колледж»', astana_id),
            ('ТОО «URBAN COLLEGE» (Урбан колледж)', astana_id),
            ('УО "Высший колледж Казпотребсоюза', astana_id),
            ('ГКП на ПХВ "Высший колледж "Astana Polytechnic" ', astana_id),
            ('ТОО «Медико-технический колледж»', astana_id)
        ]
        cursor.executemany("INSERT INTO colleges (name, city_id) VALUES (?, ?)", colleges)
    
    # Add new columns to users table if they don't exist
    print("Checking for new columns in users table...")
    
    # Get the current column names in the users table
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    
    # Check and add each column if it doesn't exist
    new_columns = {
        "telegram": "TEXT",
        "birth_date": "DATE",
        "phone_number": "TEXT",
        "gender": "TEXT",
        "city_id": "INTEGER REFERENCES cities(id)",
        "college_id": "INTEGER REFERENCES colleges(id)"
    }
    
    for column_name, column_type in new_columns.items():
        if column_name not in columns:
            print(f"Adding column {column_name} to users table...")
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
            except sqlite3.OperationalError as e:
                print(f"Error adding column {column_name}: {e}")
    
    # Commit the changes
    conn.commit()
    conn.close()
    
    print("Database setup complete!")

if __name__ == "__main__":
    setup_database()
    print("Database setup complete!")