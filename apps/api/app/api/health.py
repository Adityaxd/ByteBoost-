from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import redis.asyncio as redis

from app.core.config import settings
from app.db.database import get_db
from app.schemas import HealthCheck

router = APIRouter()


@router.get("/health", response_model=HealthCheck)
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint to verify service status
    """
    health = {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": settings.APP_VERSION,
        "database": False,
        "redis": False
    }
    
    # Check database connection
    try:
        result = await db.execute(text("SELECT 1"))
        health["database"] = result.scalar() == 1
    except Exception as e:
        health["status"] = "degraded"
        health["database"] = False
    
    # Check Redis connection
    try:
        r = redis.from_url(settings.REDIS_URL)
        await r.ping()
        health["redis"] = True
        await r.close()
    except Exception as e:
        health["status"] = "degraded"
        health["redis"] = False
    
    # Set overall status
    if not health["database"]:
        health["status"] = "unhealthy"
    
    return health


@router.get("/ping")
async def ping():
    """
    Simple ping endpoint for quick availability check
    """
    return {"pong": True, "timestamp": datetime.utcnow()}