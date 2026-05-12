from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.database.connection import Base, engine

app = FastAPI(
    title="WebHarvest Pro API"
)

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "message": "WebHarvest API Online"
    }


@app.get("/api/health")
def health():
    return {
        "status": "online"
    }