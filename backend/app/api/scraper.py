from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from tempfile import NamedTemporaryFile

from openpyxl import Workbook

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.services.database import get_db
from app.models.scraping_history import ScrapingHistory

router = APIRouter()


@router.get("/scrape")
def scrape(url: str, db: Session = Depends(get_db)):

    try:

        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        title = (
            soup.title.string.strip()
            if soup.title and soup.title.string
            else "Sem título"
        )

        description_tag = soup.find(
            "meta",
            attrs={"name": "description"}
        )

        description = (
            description_tag.get("content", "")
            if description_tag
            else ""
        )

        links = [
            urljoin(url, a["href"])
            for a in soup.find_all("a", href=True)
        ]

        images = [
            urljoin(url, img["src"])
            for img in soup.find_all("img", src=True)
        ]

        headings = {
            "h1": [
                h.get_text(strip=True)
                for h in soup.find_all("h1")
            ],

            "h2": [
                h.get_text(strip=True)
                for h in soup.find_all("h2")
            ],

            "h3": [
                h.get_text(strip=True)
                for h in soup.find_all("h3")
            ]
        }

        item = ScrapingHistory(
            url=url,
            title=title
        )

        db.add(item)
        db.commit()
        db.refresh(item)

        return {
            "id": item.id,
            "url": url,
            "title": title,
            "description": description,
            "links_count": len(links),
            "images_count": len(images),
            "headings": headings,
            "links": links[:20],
            "images": images[:20]
        }

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get("/history")
def get_history(
    db: Session = Depends(get_db)
):

    return db.query(
        ScrapingHistory
    ).order_by(
        ScrapingHistory.id.desc()
    ).all()


@router.delete("/history/{item_id}")
def delete_history_item(
    item_id: int,
    db: Session = Depends(get_db)
):

    item = db.query(
        ScrapingHistory
    ).filter(
        ScrapingHistory.id == item_id
    ).first()

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Item não encontrado"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Item deletado com sucesso"
    }


@router.get("/export/json")
def export_history_json(
    db: Session = Depends(get_db)
):

    history = db.query(
        ScrapingHistory
    ).order_by(
        ScrapingHistory.id.desc()
    ).all()

    data = [
        {
            "id": item.id,
            "title": item.title,
            "url": item.url
        }

        for item in history
    ]

    return JSONResponse(
        content=data,
        headers={
            "Content-Disposition":
            "attachment; filename=webharvest_report.json"
        }
    )


@router.get("/export/pdf")
def export_history_pdf(
    db: Session = Depends(get_db)
):

    history = db.query(
        ScrapingHistory
    ).order_by(
        ScrapingHistory.id.desc()
    ).all()

    pdf_path = "webharvest_report.pdf"

    pdf = canvas.Canvas(
        pdf_path,
        pagesize=letter
    )

    y = 750

    pdf.setFont(
        "Helvetica-Bold",
        18
    )

    pdf.drawString(
        50,
        y,
        "WebHarvest Pro - Relatório"
    )

    y -= 40

    pdf.setFont(
        "Helvetica",
        11
    )

    for item in history:

        pdf.drawString(
            50,
            y,
            f"ID: {item.id}"
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f"Título: {item.title}"
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f"URL: {item.url}"
        )

        y -= 35

        if y < 80:

            pdf.showPage()

            y = 750

            pdf.setFont(
                "Helvetica",
                11
            )

    pdf.save()

    return FileResponse(
        path=pdf_path,
        filename="webharvest_report.pdf",
        media_type="application/pdf"
    )


@router.get("/export/excel")
def export_history_excel(
    db: Session = Depends(get_db)
):

    history = db.query(
        ScrapingHistory
    ).order_by(
        ScrapingHistory.id.desc()
    ).all()

    workbook = Workbook()

    sheet = workbook.active

    sheet.title = "WebHarvest"

    sheet.append([
        "ID",
        "Título",
        "URL"
    ])

    for item in history:

        sheet.append([
            item.id,
            item.title,
            item.url
        ])

    temp_file = NamedTemporaryFile(
        delete=False,
        suffix=".xlsx"
    )

    workbook.save(
        temp_file.name
    )

    return FileResponse(
        path=temp_file.name,
        filename="webharvest_report.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )