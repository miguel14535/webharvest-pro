from sqlalchemy import Column, Integer, String

from app.database.connection import Base


class ScrapingHistory(Base):
    __tablename__ = "scraping_history"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    screenshot_url = Column(String, nullable=True)