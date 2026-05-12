from sqlalchemy import Column, Integer, String, Boolean
from app.database.connection import Base


class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True, index=True)

    url = Column(String, nullable=False)

    active = Column(Boolean, default=True)

    last_status = Column(String, default="unknown")

    last_change = Column(String, nullable=True)