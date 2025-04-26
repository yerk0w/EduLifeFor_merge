import sqlite3
import os
import sys

db_path = os.path.join(os.path.dirname(__file__), "seconddata.db")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("""
    ALTER TABLE notifications 
    ADD COLUMN target_group_id INTEGER DEFAULT NULL
""")

conn.commit()
conn.close()

print("Database updated successfully.")