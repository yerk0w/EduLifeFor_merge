import os
import database
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from datetime import datetime
from typing import List, Optional, Dict, Any
from models import KeyResponse
from utils.security import get_current_user, check_admin_role
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
    return {
        "message": "EduLife Key Management API", 
        "version": "1.0.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "keys", "timestamp": datetime.now().isoformat()}

# Get dashboard data with current key assignments
@app.get("/dashboard", response_model=List[KeyResponse])
async def get_dashboard(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get dashboard data with current key assignments based on user role"""
    # Get the user role
    user_role = current_user.get("role_name") or current_user.get("role")
    user_id = current_user["id"]
    
    # For non-admin users, only show their own keys
    if user_role != "admin":
        # Only show keys assigned to this user
        return database.get_user_keys(user_id)
    
    # Admin users can see all keys
    return database.get_all_active_key_assignments()

@app.get("/dashboard/admin", response_model=Dict[str, Any], dependencies=[Depends(check_admin_role)])
async def get_admin_dashboard(current_user: Dict[str, Any] = Depends(check_admin_role)):
    """Get extended dashboard data for administrators"""
    try:
        # Get all keys and count stats
        all_keys = database.get_all_keys()
        assigned_keys = [k for k in all_keys if k.get("user_id") is not None]
        
        # Get pending transfers
        pending_transfers = database.get_all_transfer_requests(status="pending")
        
        # Get transfer stats
        transfer_stats = database.get_transfers_stats()
        
        return {
            "total_keys": len(all_keys),
            "assigned_keys": len(assigned_keys),
            "unassigned_keys": len(all_keys) - len(assigned_keys),
            "pending_transfers": len(pending_transfers),
            "transfer_stats": transfer_stats,
            "recent_transfers": pending_transfers[:5] if pending_transfers else []
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating admin dashboard: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)