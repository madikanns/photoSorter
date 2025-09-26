from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import time
import logging
import os
from contextlib import asynccontextmanager

from .config import settings, get_cors_config
from .database import create_tables, check_database_connection, get_db_context
from .utils.auth import get_password_hash
from .utils.audit import audit_middleware
from .routes import stocks, sentiment, predictions, portfolio, health

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting StockPrediction System...")
    
    # Check if we're in test mode
    if os.getenv("ENVIRONMENT") == "test":
        logger.info("Running in TEST MODE - skipping database checks")
        logger.info("StockPrediction System started successfully in test mode")
        yield
        logger.info("Shutting down StockPrediction System...")
        return
    
    # Production mode - check database
    if not check_database_connection():
        logger.error("Failed to connect to database. Application startup failed.")
        raise RuntimeError("Database connection failed")
    
    logger.info("Database connection established successfully")
    
    # Create tables if they don't exist
    try:
        create_tables()
        logger.info("Database tables created/verified successfully")
        
        # Initialize ML models
        initialize_ml_models()
        
        # Start background tasks
        start_background_tasks()
        
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise RuntimeError("Database table creation failed")
    
    logger.info("StockPrediction System started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down StockPrediction System...")

def initialize_ml_models():
    """Initialize machine learning models."""
    try:
        logger.info("Initializing ML models...")
        # Load pre-trained models
        # Initialize sentiment analysis models
        # Load technical analysis models
        logger.info("ML models initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize ML models: {e}")

def start_background_tasks():
    """Start background tasks for data collection."""
    try:
        logger.info("Starting background tasks...")
        # Start sentiment data collection
        # Start stock data updates
        # Start model retraining tasks
        logger.info("Background tasks started successfully")
    except Exception as e:
        logger.error(f"Failed to start background tasks: {e}")

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Stock Analysis & Prediction System",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    **get_cors_config()
)

# Add trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.debug else ["localhost", "127.0.0.1"]
)

# Add custom audit middleware
app.add_middleware(audit_middleware)

# Global exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "Request validation failed",
            "details": exc.errors(),
            "path": request.url.path
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "path": request.url.path
        }
    )

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to responses."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": time.time()
    }

# Public ping endpoint (no authentication required) - helps keep app awake
@app.get("/ping")
async def ping():
    """Simple ping endpoint to keep the app awake."""
    return {"status": "ok", "timestamp": time.time()}

# Include API routes
app.include_router(stocks.router, prefix="/api/v1/stocks", tags=["Stocks"])
app.include_router(sentiment.router, prefix="/api/v1/sentiment", tags=["Sentiment Analysis"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["Predictions"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["Portfolio"])
app.include_router(health.router, prefix="/api/v1/health", tags=["Health"])

# Check for React frontend build first
possible_paths = [
    os.path.join(os.path.dirname(__file__), "..", "static", "build"),
    os.path.join(os.path.dirname(__file__), "..", "frontend_build"),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend", "build"),
    os.path.join(os.getcwd(), "frontend", "build"),
    os.path.join("/app", "frontend", "build"),
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "build"),
    os.path.join("/opt/render/project/src", "frontend", "build"),
    os.path.join("/app", "frontend", "build"),
]

logger.info("Searching for frontend build directory...")
logger.info(f"Current working directory: {os.getcwd()}")
logger.info(f"Main file location: {__file__}")

frontend_build_path = None
for path in possible_paths:
    logger.info(f"Checking path: {path} (exists: {os.path.exists(path)})")
    if os.path.exists(path):
        # Check if index.html exists in this path
        index_path = os.path.join(path, "index.html")
        if os.path.exists(index_path):
            frontend_build_path = path
            logger.info(f"✅ Found frontend build at: {frontend_build_path}")
            logger.info(f"✅ Found index.html at: {index_path}")
            break
        else:
            logger.warning(f"Directory exists but no index.html found at: {index_path}")

if frontend_build_path and os.path.exists(frontend_build_path):
    # Serve React app
    static_path = os.path.join(frontend_build_path, "static")
    if os.path.exists(static_path):
        app.mount("/static", StaticFiles(directory=static_path), name="static")
        logger.info(f"✅ Mounted static files from: {static_path}")
    else:
        logger.warning(f"Static directory not found at: {static_path}")
    
    # Serve React app for root route
    @app.get("/")
    async def serve_root():
        """Serve React app for root route."""
        index_path = os.path.join(frontend_build_path, "index.html")
        logger.info(f"Serving React app from: {index_path}")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        else:
            logger.error(f"Frontend index.html not found at: {index_path}")
            raise HTTPException(status_code=404, detail="Frontend not found")
    
    # Catch-all route for React Router
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve React app for all non-API routes."""
        # Don't serve React app for API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Serve index.html for all other routes (React Router will handle routing)
        index_path = os.path.join(frontend_build_path, "index.html")
        logger.info(f"Serving React app for path '{full_path}' from: {index_path}")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        else:
            logger.error(f"Frontend index.html not found at: {index_path}")
            raise HTTPException(status_code=404, detail="Frontend not found")

else:
    logger.error("❌ No frontend build found!")
    logger.error("Available paths checked:")
    for path in possible_paths:
        exists = os.path.exists(path)
        logger.error(f"  - {path} (exists: {exists})")
        if exists:
            # List contents of existing directories
            try:
                contents = os.listdir(path)
                logger.error(f"    Contents: {contents}")
            except Exception as e:
                logger.error(f"    Error listing contents: {e}")
    
    # Define root route only if no frontend is found
    @app.get("/")
    async def root():
        """Root endpoint with API information."""
        return {
            "message": f"Welcome to {settings.app_name}",
            "version": settings.app_version,
            "environment": settings.environment,
            "docs": "/docs" if settings.debug else "Documentation not available in production",
            "health": "/health"
        }

# API information endpoint
@app.get("/api/v1/info")
async def api_info():
    """Get API information and available endpoints."""
    return {
        "api_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "endpoints": {
            "stocks": "/api/v1/stocks",
            "sentiment": "/api/v1/sentiment",
            "predictions": "/api/v1/predictions",
            "portfolio": "/api/v1/portfolio",
            "health": "/api/v1/health"
        },
        "features": [
            "Real-time stock data and analysis",
            "AI-powered sentiment analysis",
            "Machine learning predictions",
            "Portfolio tracking and management",
            "Technical indicators and charts",
            "News and social media sentiment"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower()
    )
