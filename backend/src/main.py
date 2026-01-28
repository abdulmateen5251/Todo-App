"""FastAPI application initialization."""
import os
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from src.db.session import init_db
from src.api.tasks import router as tasks_router
from src.api.users import router as users_router
from src.api.chat import router as chat_router

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup: Initialize database
    await init_db()
    yield
    # Shutdown: Cleanup (if needed)


# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

# Create FastAPI application
app = FastAPI(
    title="Todo API",
    description="Authenticated Todo Application REST API with Better Auth integration",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration - Allow Vercel, localhost, and Hugging Face
cors_origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:3000",           # Local development
    "http://localhost:3001",           # Alternative local port
    "https://*.vercel.app",            # Vercel preview deployments
    "https://huggingface.co",          # Hugging Face UI
]

# Add custom origins from environment variable
if cors_origins_env:
    allowed_origins.extend([origin.strip() for origin in cors_origins_env.split(",") if origin.strip()])

logger.info(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all in dev - set CORS_ORIGINS in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Request-ID"],
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# Request/Response Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and responses."""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"status={response.status_code} duration={process_time:.3f}s"
        )
        
        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"Error: {request.method} {request.url.path} "
            f"error={str(e)} duration={process_time:.3f}s"
        )
        raise


# Include API Routers
from src.api.chat import router as chat_router

app.include_router(users_router)
app.include_router(tasks_router, prefix="/api", tags=["tasks"])
app.include_router(chat_router, tags=["chat"])


# Exception Handlers
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle validation errors."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(exc),
            },
            "status": 400
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    # Log error details
    import traceback
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    
    # Handle specific error types
    error_message = "An unexpected error occurred. Please try again later."
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "INTERNAL_ERROR"
    
    # OpenAI API errors
    if "openai" in str(type(exc)).lower():
        if "timeout" in str(exc).lower():
            error_message = "The AI service is taking too long to respond. Please try again."
            error_code = "AI_TIMEOUT"
            status_code = status.HTTP_504_GATEWAY_TIMEOUT
        elif "rate_limit" in str(exc).lower() or "429" in str(exc):
            error_message = "Too many requests to the AI service. Please wait a moment and try again."
            error_code = "AI_RATE_LIMIT"
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
        else:
            error_message = "The AI service encountered an error. Please try again."
            error_code = "AI_ERROR"
    
    # Database errors
    elif "asyncpg" in str(type(exc)).lower() or "sqlalchemy" in str(type(exc)).lower():
        error_message = "A database error occurred. Please try again later."
        error_code = "DATABASE_ERROR"
    
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": error_code,
                "message": error_message,
            },
            "status": status_code
        }
    )


# Health Check Endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "todo-api",
        "version": "1.0.0"
    }


# Include routers
app.include_router(tasks_router, tags=["tasks"])
app.include_router(users_router, tags=["users"])
app.include_router(chat_router, tags=["chat"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=os.getenv("DEBUG", "False").lower() == "true"
    )
