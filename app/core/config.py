import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "WebHarvest Pro"
    API_VERSION: str = "1.0.0"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://webharvest:webharvest@localhost:5432/webharvest_db"
    )

settings = Settings()