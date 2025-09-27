from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import psutil
import os

from ..database import get_db, check_database_connection
from ..config import settings

router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check with system metrics."""
    try:
        # Database connection check
        db_status = check_database_connection()
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Application metrics
        process = psutil.Process(os.getpid())
        memory_usage = process.memory_info().rss / 1024 / 1024  # MB
        
        return {
            "status": "healthy" if db_status else "degraded",
            "service": settings.app_name,
            "version": settings.app_version,
            "environment": settings.environment,
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "status": "connected" if db_status else "disconnected",
                "url": settings.database_url.split('@')[1] if '@' in settings.database_url else "hidden"
            },
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent,
                "app_memory_mb": round(memory_usage, 2)
            },
            "uptime": {
                "process_uptime_seconds": process.create_time(),
                "system_uptime_seconds": psutil.boot_time()
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Kubernetes readiness probe."""
    try:
        # Check database connection
        if not check_database_connection():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not available"
            )
        
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service not ready: {str(e)}"
        )

@router.get("/live")
async def liveness_check():
    """Kubernetes liveness probe."""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }
