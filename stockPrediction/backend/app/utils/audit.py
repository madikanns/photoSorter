from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)

class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware for auditing API requests."""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {response.status_code} - "
            f"Process time: {process_time:.3f}s - "
            f"Path: {request.url.path}"
        )
        
        return response

def audit_middleware(app):
    """Add audit middleware to the app."""
    app.add_middleware(AuditMiddleware)
    return app
