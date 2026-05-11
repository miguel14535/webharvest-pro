import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME = "WebHarvest Pro API"
    API_VERSION = "1.0.0"

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://webharvest:webharvest@localhost:5432/webharvest_db"
    )

settings = Settings()