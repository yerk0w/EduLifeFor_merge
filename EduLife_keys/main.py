import os
import database
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from datetime import datetime
from typing import List, Optional
from models import KeyCreate, KeyUpdate, KeyTransferCreate, KeyTransferResponse, KeyResponse
from utils.security import get_current_user, check_admin_role, check_teacher_or_admin_role
from routers import keys, transfers, history

# Environment settings
PORT = int(os.getenv("PORT", "8120"))

# Create FastAPI application
app = FastAPI(
    title="EduLife Key Management API",
    description="API for managing classroom keys and their transfers between teachers",
    version="1.0.0"
)

# Add middleware for response compression
app.add_middleware(GZipMiddleware, minimum_size=100)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, limit to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    database.create_tables()

# Include routers
app.include_router(keys.router)
app.include_router(transfers.router)
app.include_router(history.router)

@app.get("/")
def read_root():
    return {"message": "EduLife Key Management API", "version": "1.0.0"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "keys", "timestamp": datetime.now().isoformat()}

# Get all active key assignments (for dashboard)
@app.get("/dashboard", response_model=List[KeyResponse])
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """Get current key assignments for dashboard view"""
    # Check if user role exists at 'role_name' or just 'role'
    user_role = current_user.get("role_name") or current_user.get("role")
    
    # For non-admin users, only show information relevant to them
    if user_role != "admin":
        # Filter keys to only show those assigned to this teacher
        teacher_keys = database.get_teacher_keys(current_user["id"])
        return teacher_keys
    
    # Admin users can see all keys
    return database.get_all_active_key_assignments()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)