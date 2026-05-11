from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter

import requests

from bs4 import BeautifulSoup
from urllib.parse import urljoin

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
            timeout=15
        )

        response.raise_for_status()

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
            description_tag.get("content").strip()
            if description_tag and description_tag.get("content")
            else "Sem descrição"
        )

        links = []

        for link in soup.find_all("a", href=True)[:20]:
            links.append(
                urljoin(url, link["href"])
            )

        images = []

        for image in soup.find_all("img", src=True)[:20]:
            images.append(
                urljoin(url, image["src"])
            )

        headings = {
            "h1": [
                h.get_text(strip=True)
                for h in soup.find_all("h1")[:10]
            ],

            "h2": [
                h.get_text(strip=True)
                for h in soup.find_all("h2")[:10]
            ],

            "h3": [
                h.get_text(strip=True)
                for h in soup.find_all("h3")[:10]
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
            "links": links,
            "images": images
        }

    except requests.exceptions.RequestException as error:

        raise HTTPException(
            status_code=400,
            detail=f"Erro ao acessar o site: {str(error)}"
        )


@router.get("/history")
def get_history(db: Session = Depends(get_db)):

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

        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Item deleted successfully"
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
            "url": item.url,
            "title": item.title
        }
        for item in history
    ]

    return JSONResponse(
        content=data,
        headers={
            "Content-Disposition":
            "attachment; filename=webharvest-history.json"
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

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter
    )

    styles = getSampleStyleSheet()

    elements = []

    title = Paragraph(
        "<b>WebHarvest Pro - Relatório de Scraping</b>",
        styles["Title"]
    )

    elements.append(title)

    elements.append(
        Spacer(1, 20)
    )

    for item in history:

        text = f"""
        <b>ID:</b> {item.id}<br/>
        <b>Título:</b> {item.title}<br/>
        <b>URL:</b> {item.url}<br/><br/>
        """

        paragraph = Paragraph(
            text,
            styles["BodyText"]
        )

        elements.append(paragraph)

        elements.append(
            Spacer(1, 12)
        )

    doc.build(elements)

    return FileResponse(
        path=pdf_path,
        filename="webharvest_report.pdf",
        media_type="application/pdf"
    )