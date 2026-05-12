from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.monitor import Monitor

router = APIRouter(
    prefix="/api/monitor",
    tags=["Monitor"]
)


@router.post("/add")
def add_monitor(
    url: str,
    db: Session = Depends(get_db)
):
    monitor = Monitor(
        url=url,
        active=True,
        last_status="online"
    )

    db.add(monitor)
    db.commit()
    db.refresh(monitor)

    return monitor


@router.get("/list")
def list_monitors(
    db: Session = Depends(get_db)
):
    return db.query(Monitor).all()


@router.delete("/{monitor_id}")
def delete_monitor(
    monitor_id: int,
    db: Session = Depends(get_db)
):
    monitor = (
        db.query(Monitor)
        .filter(Monitor.id == monitor_id)
        .first()
    )

    if not monitor:
        return {"error": "Monitor não encontrado"}

    db.delete(monitor)
    db.commit()

    return {"message": "Monitor removido"}