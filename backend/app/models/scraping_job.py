from sqlalchemy import Column, Integer, String
from app.database.connection import Base

class ScrapingJob(Base):
    __tablename__ = "scraping_jobs"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    status = Column(String, default="completed")