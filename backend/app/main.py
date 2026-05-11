from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings

from app.database.connection import engine, Base

from app.models.scraping_history import ScrapingHistory

from app.models.scraping_job import ScrapingJob

# cria tabelas automaticamente
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# rotas
app.include_router(router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "WebHarvest Pro API Running"
    }