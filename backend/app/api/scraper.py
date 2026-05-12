from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
from openpyxl import Workbook
import json

from app.database.connection import get_db
from app.models.user import ScrapingHistory
from app.services.scraper_service import scrape_website

router = APIRouter(prefix="/api/scraper", tags=["Scraper"])


@router.get("/scrape")
def scrape(url: str, db: Session = Depends(get_db)):
    data = scrape_website(url)

    new_item = ScrapingHistory(
        url=url,
        title=data.get("title", "Sem título"),
        description=data.get("description", ""),
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "message": "Scraping realizado com sucesso",
        "data": data,
    }


@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    history = (
        db.query(ScrapingHistory)
        .order_by(ScrapingHistory.id.desc())
        .all()
    )

    return history


@router.delete("/history/{item_id}")
def delete_history_item(
    item_id: int,
    db: Session = Depends(get_db),
):
    item = (
        db.query(ScrapingHistory)
        .filter(ScrapingHistory.id == item_id)
        .first()
    )

    if not item:
        return {"message": "Item não encontrado"}

    db.delete(item)
    db.commit()

    return {"message": "Item removido"}


@router.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    db.query(ScrapingHistory).delete()
    db.commit()

    return {
        "message": "Histórico limpo com sucesso"
    }


@router.get("/export/json")
def export_history_json(
    db: Session = Depends(get_db),
):
    history = (
        db.query(ScrapingHistory)
        .order_by(ScrapingHistory.id.desc())
        .all()
    )

    data = []

    for item in history:
        data.append({
            "id": item.id,
            "title": item.title,
            "url": item.url,
            "description": item.description,
        })

    json_path = "webharvest_export.json"

    with open(
        json_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            data,
            file,
            indent=4,
            ensure_ascii=False,
        )

    return FileResponse(
        path=json_path,
        filename="webharvest_export.json",
        media_type="application/json",
    )


@router.get("/export/pdf")
def export_history_pdf(
    db: Session = Depends(get_db),
):
    history = (
        db.query(ScrapingHistory)
        .order_by(ScrapingHistory.id.desc())
        .all()
    )

    pdf_path = "webharvest_report.pdf"

    pdf = canvas.Canvas(pdf_path)

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(
        100,
        800,
        "WebHarvest Report"
    )

    y = 760

    pdf.setFont("Helvetica", 12)

    for item in history:
        text = (
            f"{item.id} - "
            f"{item.title} - "
            f"{item.url}"
        )

        pdf.drawString(50, y, text)

        y -= 25

        if y < 80:
            pdf.showPage()
            y = 800

    pdf.save()

    return FileResponse(
        path=pdf_path,
        filename="webharvest_report.pdf",
        media_type="application/pdf",
    )


@router.get("/export/excel")
def export_history_excel(
    db: Session = Depends(get_db),
):
    history = (
        db.query(ScrapingHistory)
        .order_by(ScrapingHistory.id.desc())
        .all()
    )

    workbook = Workbook()

    sheet = workbook.active
    sheet.title = "WebHarvest"

    sheet.append([
        "ID",
        "Título",
        "URL",
        "Descrição",
    ])

    for item in history:
        sheet.append([
            item.id,
            item.title,
            item.url,
            item.description,
        ])

    excel_path = "webharvest_report.xlsx"

    workbook.save(excel_path)

    return FileResponse(
        path=excel_path,
        filename="webharvest_report.xlsx",
        media_type=(
            "application/vnd.openxmlformats-"
            "officedocument.spreadsheetml.sheet"
        ),
    )