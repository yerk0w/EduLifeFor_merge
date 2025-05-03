import sqlite3
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

# Database path
db_path = os.path.join(os.path.dirname(__file__), "keys_database.db")

def get_db_connection():
    """Create a database connection with row factory"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    """Create necessary database tables if they don't exist"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Keys table - stores information about all physical keys
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_code TEXT NOT NULL UNIQUE,
            room_number TEXT NOT NULL,
            building TEXT,
            floor INTEGER,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Key Assignments table - tracks who currently has each key
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS key_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_id INTEGER NOT NULL,
            teacher_id INTEGER NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (key_id) REFERENCES keys(id),
            UNIQUE(key_id, is_active) ON CONFLICT REPLACE
        )
    """)

    # Key Transfer Requests table - tracks requests to transfer keys between teachers
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS key_transfers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_id INTEGER NOT NULL,
            from_teacher_id INTEGER NOT NULL,
            to_teacher_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (key_id) REFERENCES keys(id)
        )
    """)

    # Key History table - maintains a complete history of all key transfers
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS key_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_id INTEGER NOT NULL,
            from_teacher_id INTEGER,
            to_teacher_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (key_id) REFERENCES keys(id)
        )
    """)

    # Insert some sample keys if the keys table is empty
    cursor.execute("SELECT COUNT(*) FROM keys")
    if cursor.fetchone()[0] == 0:
        sample_keys = [
            ('K001', '301', 'Main Building', 3, 'Computer Science Lab'),
            ('K002', '302', 'Main Building', 3, 'Physics Lab'),
            ('K003', '303', 'Main Building', 3, 'Chemistry Lab'),
            ('K004', '201', 'Main Building', 2, 'Lecture Hall'),
            ('K005', '202', 'Main Building', 2, 'Mathematics Room'),
            ('K006', '101', 'Science Building', 1, 'Biology Lab'),
            ('K007', '102', 'Science Building', 1, 'Conference Room'),
            ('K008', '501', 'Library Building', 5, 'Reading Room')
        ]
        
        cursor.executemany("""
            INSERT INTO keys (key_code, room_number, building, floor, description)
            VALUES (?, ?, ?, ?, ?)
        """, sample_keys)

    conn.commit()
    conn.close()

# Key CRUD operations
def get_all_keys():
    """Get all keys from the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            k.id, k.key_code, k.room_number, k.building, k.floor, k.description,
            ka.teacher_id, ka.assigned_at, ka.is_active
        FROM keys k
        LEFT JOIN key_assignments ka ON k.id = ka.key_id AND ka.is_active = 1
        ORDER BY k.building, k.floor, k.room_number
    """)
    
    keys = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return keys

def get_key_by_id(key_id: int):
    """Get a key by its ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            k.id, k.key_code, k.room_number, k.building, k.floor, k.description,
            ka.teacher_id, ka.assigned_at, ka.is_active
        FROM keys k
        LEFT JOIN key_assignments ka ON k.id = ka.key_id AND ka.is_active = 1
        WHERE k.id = ?
    """, (key_id,))
    
    key = cursor.fetchone()
    conn.close()
    
    if key:
        return dict(key)
    return None

def create_key(key_data: Dict[str, Any]):
    """Create a new key"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO keys (key_code, room_number, building, floor, description)
            VALUES (?, ?, ?, ?, ?)
        """, (
            key_data["key_code"],
            key_data["room_number"],
            key_data.get("building"),
            key_data.get("floor"),
            key_data.get("description")
        ))
        
        key_id = cursor.lastrowid
        
        if "teacher_id" in key_data and key_data["teacher_id"]:

            cursor.execute("""
                INSERT INTO key_assignments (key_id, teacher_id)
                VALUES (?, ?)
            """, (key_id, key_data["teacher_id"]))
            
            # Add to history
            cursor.execute("""
                INSERT INTO key_history (key_id, to_teacher_id, action, notes)
                VALUES (?, ?, ?, ?)
            """, (
                key_id,
                key_data["teacher_id"],
                "initial_assignment",
                "Initial key assignment"
            ))
        
        conn.commit()
        return key_id
    
    except sqlite3.IntegrityError:
        conn.rollback()
        raise ValueError(f"Key with code {key_data['key_code']} already exists")
    finally:
        conn.close()

def update_key(key_id: int, key_data: Dict[str, Any]):
    """Update key information"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # First check if the key exists
        cursor.execute("SELECT id FROM keys WHERE id = ?", (key_id,))
        if not cursor.fetchone():
            conn.close()
            raise ValueError(f"Key with ID {key_id} does not exist")
        
        update_fields = []
        update_values = []
        
        for field in ["key_code", "room_number", "building", "floor", "description"]:
            if field in key_data and key_data[field] is not None:
                update_fields.append(f"{field} = ?")
                update_values.append(key_data[field])
        
        if not update_fields:
            conn.close()
            return key_id
        
        update_values.append(key_id)
        
        cursor.execute(f"""
            UPDATE keys 
            SET {', '.join(update_fields)} 
            WHERE id = ?
        """, update_values)
        
        conn.commit()
        return key_id
    
    except sqlite3.IntegrityError:
        conn.rollback()
        raise ValueError(f"Key with code {key_data.get('key_code')} already exists")
    finally:
        conn.close()

def delete_key(key_id: int):
    """Delete a key"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check if key is currently assigned
        cursor.execute(
            "SELECT id FROM key_assignments WHERE key_id = ? AND is_active = 1", 
            (key_id,)
        )
        if cursor.fetchone():
            raise ValueError(f"Cannot delete key with ID {key_id} as it is currently assigned")

        # Check if there are pending transfers
        cursor.execute(
            "SELECT id FROM key_transfers WHERE key_id = ? AND status = 'pending'", 
            (key_id,)
        )
        if cursor.fetchone():
            raise ValueError(f"Cannot delete key with ID {key_id} as it has pending transfer requests")

        # Delete the key and related records
        cursor.execute("DELETE FROM keys WHERE id = ?", (key_id,))
        cursor.execute("DELETE FROM key_assignments WHERE key_id = ?", (key_id,))
        cursor.execute("DELETE FROM key_transfers WHERE key_id = ?", (key_id,))
        cursor.execute("DELETE FROM key_history WHERE key_id = ?", (key_id,))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print(f"Error deleting key: {e}")
        raise

    finally:
        conn.close()

# Key Assignment operations
def get_teacher_keys(user_id: int):
    """Get all keys currently assigned to a teacher"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            k.id, k.key_code, k.room_number, k.building, k.floor, k.description,
            ka.assigned_at
        FROM keys k
        JOIN key_assignments ka ON k.id = ka.key_id
        WHERE ka.teacher_id = ? AND ka.is_active = 1
        ORDER BY k.building, k.floor, k.room_number
    """, (user_id,))
    
    keys = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return keys

def assign_key(key_id: int, teacher_id: int, notes: Optional[str] = None):
    """Assign a key to a teacher"""
    conn = get_db_connection()

    try:
        cursor = conn.cursor()
        # First check if the key exists
        cursor.execute("SELECT id FROM keys WHERE id = ?", (key_id,))
        if not cursor.fetchone():
            conn.close()
            raise ValueError(f"Key with ID {key_id} does not exist")
        
        # Check if key is already assigned to someone else
        cursor.execute(
            "SELECT teacher_id FROM key_assignments WHERE key_id = ? AND is_active = 1", 
            (key_id,)
        )
        
        existing = cursor.fetchone()
        if existing:
            if existing["teacher_id"] == teacher_id:
                conn.close()
                raise ValueError(f"Key is already assigned to this teacher")
            else:
                # Deactivate the current assignment
                cursor.execute(
                    "UPDATE key_assignments SET is_active = 0 WHERE key_id = ? AND is_active = 1", 
                    (key_id,)
                )
                
                # Record in history
                cursor.execute("""
                    INSERT INTO key_history 
                    (key_id, from_teacher_id, to_teacher_id, action, notes)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    key_id,
                    existing["teacher_id"],
                    teacher_id,
                    "transfer",
                    notes or "Direct reassignment by admin"
                ))
        else:
            # Record in history - initial assignment or reassignment
            cursor.execute("""
                INSERT INTO key_history 
                (key_id, to_teacher_id, action, notes)
                VALUES (?, ?, ?, ?)
            """, (
                key_id,
                teacher_id,
                "assignment",
                notes or "Assigned by admin"
            ))
        
        # Create the new assignment
        cursor.execute("""
            INSERT INTO key_assignments (key_id, teacher_id)
            VALUES (?, ?)
        """, (key_id, teacher_id))
        
        conn.commit()
        return True
    
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def unassign_key(key_id: int, notes: Optional[str] = None):
    """Unassign a key (return to management)"""
    conn = get_db_connection()

    try:
        cursor = conn.cursor()
        # First check if the key exists and is assigned
        cursor.execute(
            "SELECT teacher_id FROM key_assignments WHERE key_id = ? AND is_active = 1", 
            (key_id,)
        )
        
        assignment = cursor.fetchone()
        if not assignment:
            conn.close()
            raise ValueError(f"Key with ID {key_id} is not currently assigned")
        
        # Deactivate the assignment
        cursor.execute(
            "UPDATE key_assignments SET is_active = 0 WHERE key_id = ? AND is_active = 1", 
            (key_id,)
        )
        
        # Record in history
        cursor.execute("""
            INSERT INTO key_history 
            (key_id, from_teacher_id, action, notes)
            VALUES (?, ?, ?, ?)
        """, (
            key_id,
            assignment["teacher_id"],
            "return",
            notes or "Returned to management"
        ))
        
        conn.commit()
        return True
    
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# Key Transfer operations
def get_all_transfer_requests(status: Optional[str] = None):
    """Get all key transfer requests, optionally filtered by status"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            kt.id, kt.key_id, kt.from_teacher_id, kt.to_teacher_id, 
            kt.status, kt.requested_at, kt.completed_at, kt.notes,
            k.key_code, k.room_number, k.building
        FROM key_transfers kt
        JOIN keys k ON kt.key_id = k.id
    """
    
    params = []
    if status:
        query += " WHERE kt.status = ?"
        params.append(status)
    
    query += " ORDER BY kt.requested_at DESC"
    
    cursor.execute(query, params)
    
    transfers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return transfers

def get_teacher_incoming_transfers(teacher_id: int):
    """Get all pending key transfer requests to a teacher"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            kt.id, kt.key_id, kt.from_teacher_id, kt.to_teacher_id, 
            kt.status, kt.requested_at, kt.notes,
            k.key_code, k.room_number, k.building
        FROM key_transfers kt
        JOIN keys k ON kt.key_id = k.id
        WHERE kt.to_teacher_id = ? AND kt.status = 'pending'
        ORDER BY kt.requested_at DESC
    """, (teacher_id,))
    
    transfers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return transfers

def get_teacher_outgoing_transfers(teacher_id: int):
    """Get all key transfer requests from a teacher"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            kt.id, kt.key_id, kt.from_teacher_id, kt.to_teacher_id, 
            kt.status, kt.requested_at, kt.completed_at, kt.notes,
            k.key_code, k.room_number, k.building
        FROM key_transfers kt
        JOIN keys k ON kt.key_id = k.id
        WHERE kt.from_teacher_id = ?
        ORDER BY kt.requested_at DESC
    """, (teacher_id,))
    
    transfers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return transfers

def create_transfer_request(transfer_data: Dict[str, Any]):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check if key exists
        cursor.execute("SELECT id FROM keys WHERE id = ?", (transfer_data["key_id"],))
        if not cursor.fetchone():
            raise ValueError(f"Key with ID {transfer_data['key_id']} does not exist")

        # Check current assignment
        cursor.execute(
            "SELECT id FROM key_assignments WHERE key_id = ? AND teacher_id = ? AND is_active = 1", 
            (transfer_data["key_id"], transfer_data["from_teacher_id"])
        )
        if not cursor.fetchone():
            raise ValueError("Key is not currently assigned to the requesting teacher")

        # Check for pending transfer
        cursor.execute(
            "SELECT id FROM key_transfers WHERE key_id = ? AND status = 'pending'", 
            (transfer_data["key_id"],)
        )
        if cursor.fetchone():
            raise ValueError("There is already a pending transfer request for this key")

        # Insert the transfer request
        cursor.execute("""
            INSERT INTO key_transfers 
            (key_id, from_teacher_id, to_teacher_id, notes)
            VALUES (?, ?, ?, ?)
        """, (
            transfer_data["key_id"],
            transfer_data["from_teacher_id"],
            transfer_data["to_teacher_id"],
            transfer_data.get("notes")
        ))

        conn.commit()
        return {"transfer_id": cursor.lastrowid}

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def approve_transfer_request(transfer_id: int):
    """Approve and complete a key transfer request"""
    conn = get_db_connection()

    try:
        cursor = conn.cursor() 
        # Get the transfer request
        cursor.execute("""
            SELECT key_id, from_teacher_id, to_teacher_id, notes
            FROM key_transfers
            WHERE id = ? AND status = 'pending'
        """, (transfer_id,))
        
        transfer = cursor.fetchone()
        if not transfer:
            conn.close()
            raise ValueError(f"Pending transfer request with ID {transfer_id} not found")
        
        # Update the transfer status
        cursor.execute("""
            UPDATE key_transfers
            SET status = 'approved', completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (transfer_id,))
        
        # Deactivate the current assignment
        cursor.execute(
            "UPDATE key_assignments SET is_active = 0 WHERE key_id = ? AND is_active = 1", 
            (transfer["key_id"],)
        )
        
        # Create the new assignment
        cursor.execute("""
            INSERT INTO key_assignments (key_id, teacher_id)
            VALUES (?, ?)
        """, (transfer["key_id"], transfer["to_teacher_id"]))
        
        # Record in history
        cursor.execute("""
            INSERT INTO key_history 
            (key_id, from_teacher_id, to_teacher_id, action, notes)
            VALUES (?, ?, ?, ?, ?)
        """, (
            transfer["key_id"],
            transfer["from_teacher_id"],
            transfer["to_teacher_id"],
            "transfer",
            transfer["notes"] or "Key transfer approved"
        ))
        
        conn.commit()
        return True
    
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def reject_transfer_request(transfer_id: int, reason: Optional[str] = None):
    """Reject a key transfer request"""
    conn = get_db_connection()
    
    try:
        cursor = conn.cursor()
        # Get the transfer request
        cursor.execute("""
            SELECT id FROM key_transfers
            WHERE id = ? AND status = 'pending'
        """, (transfer_id,))
        
        if not cursor.fetchone():
            conn.close()
            raise ValueError(f"Pending transfer request with ID {transfer_id} not found")
        
        # Update the transfer status
        cursor.execute("""
            UPDATE key_transfers
            SET status = 'rejected', completed_at = CURRENT_TIMESTAMP, 
                notes = CASE WHEN notes IS NULL OR notes = '' 
                         THEN ? 
                         ELSE notes || ' | Rejection reason: ' || ? END
            WHERE id = ?
        """, (reason or "Request rejected", reason or "Request rejected", transfer_id))
        
        conn.commit()
        return True
    
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def cancel_transfer_request(transfer_id: int):
    """Cancel a key transfer request (by the initiating teacher)"""
    conn = get_db_connection()
    
    try:
        cursor = conn.cursor()
        # Get the transfer request
        cursor.execute("""
            SELECT id FROM key_transfers
            WHERE id = ? AND status = 'pending'
        """, (transfer_id,))
        
        if not cursor.fetchone():
            conn.close()
            raise ValueError(f"Pending transfer request with ID {transfer_id} not found")
        
        # Update the transfer status
        cursor.execute("""
            UPDATE key_transfers
            SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (transfer_id,))
        
        conn.commit()
        return True
    
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# Key History operations
def get_key_history(key_id: int):
    """Get the history of a specific key"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            id, key_id, from_teacher_id, to_teacher_id, action, timestamp, notes
        FROM key_history
        WHERE key_id = ?
        ORDER BY timestamp DESC
    """, (key_id,))
    
    history = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return history

def get_teacher_key_history(teacher_id: int):
    """Get the key history for a specific teacher"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            kh.id, kh.key_id, kh.from_teacher_id, kh.to_teacher_id, 
            kh.action, kh.timestamp, kh.notes,
            k.key_code, k.room_number, k.building
        FROM key_history kh
        JOIN keys k ON kh.key_id = k.id
        WHERE kh.from_teacher_id = ? OR kh.to_teacher_id = ?
        ORDER BY kh.timestamp DESC
    """, (teacher_id, teacher_id))
    
    history = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return history

# Dashboard and reporting functions
def get_all_active_key_assignments():
    """Get all currently active key assignments for dashboard"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            k.id, k.key_code, k.room_number, k.building, k.floor, k.description,
            ka.teacher_id, ka.assigned_at
        FROM keys k
        LEFT JOIN key_assignments ka ON k.id = ka.key_id AND ka.is_active = 1
        ORDER BY k.building, k.floor, k.room_number
    """)
    
    assignments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return assignments

def get_pending_transfers_count():
    """Get count of pending transfer requests"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as count FROM key_transfers WHERE status = 'pending'")
    
    result = cursor.fetchone()
    conn.close()
    
    return result["count"] if result else 0

def get_transfers_stats():
    """Get statistics on key transfers"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get counts for different statuses
    cursor.execute("""
        SELECT 
            status, COUNT(*) as count
        FROM key_transfers
        GROUP BY status
    """)
    
    status_counts = {row["status"]: row["count"] for row in cursor.fetchall()}
    
    # Get counts for daily transfers (last 7 days)
    today = datetime.now().date()
    seven_days_ago = today - timedelta(days=7)
    
    cursor.execute("""
        SELECT 
            DATE(completed_at) as date, COUNT(*) as count
        FROM key_transfers
        WHERE status = 'approved' AND completed_at >= ?
        GROUP BY DATE(completed_at)
        ORDER BY date
    """, (seven_days_ago.isoformat(),))
    
    daily_transfers = {row["date"]: row["count"] for row in cursor.fetchall()}
    
    # Fill in missing days with zero
    for i in range(7):
        date_str = (seven_days_ago + timedelta(days=i)).isoformat()
        if date_str not in daily_transfers:
            daily_transfers[date_str] = 0
    
    conn.close()
    
    return {
        "status_counts": status_counts,
        "daily_transfers": daily_transfers
    }

def get_unassigned_keys_count():
    """Get count of keys that are not currently assigned"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) as count 
        FROM keys k
        LEFT JOIN key_assignments ka ON k.id = ka.key_id AND ka.is_active = 1
        WHERE ka.id IS NULL
    """)
    
    result = cursor.fetchone()
    conn.close()
    
    return result["count"] if result else 0