from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from bs4 import BeautifulSoup
from urllib.parse import urljoin

from openpyxl import Workbook
from tempfile import NamedTemporaryFile

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

import requests

from app.services.database import get_db
from app.models.scraping_history import ScrapingHistory

router = APIRouter(
    prefix="/api/scraper",
    tags=["Scraper"]
)


@router.get("/scrape")
def scrape(
    url: str,
    db: Session = Depends(get_db)
):

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
            if soup.title
            else "Sem título"
        )

        description = ""

        description_tag = soup.find(
            "meta",
            attrs={"name": "description"}
        )

        if description_tag:
            description = description_tag.get(
                "content",
                ""
            )

        links = []

        for a in soup.find_all("a", href=True):

            href = urljoin(
                url,
                a["href"]
            )

            links.append(href)

        images = []

        for img in soup.find_all("img", src=True):

            src = urljoin(
                url,
                img["src"]
            )

            images.append(src)

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
            ],
        }

        history_item = ScrapingHistory(
            url=url,
            title=title
        )

        db.add(history_item)
        db.commit()
        db.refresh(history_item)

        return {
            "id": history_item.id,
            "url": url,
            "title": title,
            "description": description,
            "links_count": len(links),
            "images_count": len(images),
            "headings": headings,
            "links": links[:20],
            "images": images[:20]
        }

    except Exception as e:

        return {
            "error": str(e)
        }


@router.get("/history")
def get_history(
    db: Session = Depends(get_db)
):

    history = db.query(
        ScrapingHistory
    ).order_by(
        ScrapingHistory.id.desc()
    ).all()

    return history


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
        return {
            "error": "Item não encontrado"
        }

    db.delete(item)
    db.commit()

    return {
        "message": "Item deletado com sucesso"
    }


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

    c = canvas.Canvas(
        pdf_path,
        pagesize=letter
    )

    y = 750

    c.setFont(
        "Helvetica-Bold",
        18
    )

    c.drawString(
        50,
        y,
        "WebHarvest Report"
    )

    y -= 40

    c.setFont(
        "Helvetica",
        12
    )

    for item in history:

        c.drawString(
            50,
            y,
            f"ID: {item.id}"
        )

        y -= 20

        c.drawString(
            50,
            y,
            f"Título: {item.title}"
        )

        y -= 20

        c.drawString(
            50,
            y,
            f"URL: {item.url}"
        )

        y -= 40

        if y < 100:
            c.showPage()
            y = 750

    c.save()

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

    headers = [
        "ID",
        "Título",
        "URL"
    ]

    sheet.append(headers)

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