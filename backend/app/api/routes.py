from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.scraper import router as scraper_router

router = APIRouter()

router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

router.include_router(
    users_router,
    prefix="/users",
    tags=["Users"]
)

router.include_router(
    scraper_router,
    prefix="/scraper",
    tags=["Scraper"]
)

@router.get("/health")
def health():
    return {
        "status": "ok",
        "service": "WebHarvest Pro API"
    }