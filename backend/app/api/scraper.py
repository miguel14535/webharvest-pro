from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import json
import uuid
import requests

from pathlib import Path
from tempfile import NamedTemporaryFile
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from openpyxl import Workbook

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from playwright.sync_api import sync_playwright

from app.services.database import get_db
from app.models.scraping_history import ScrapingHistory

router = APIRouter()

STATIC_DIR = Path("static")
SCREENSHOT_DIR = STATIC_DIR / "screenshots"
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


def normalize_url(url: str):
    if not url.startswith("http://") and not url.startswith("https://"):
        return f"https://{url}"

    return url


def take_screenshot(url: str):
    filename = f"{uuid.uuid4()}.png"
    screenshot_path = SCREENSHOT_DIR / filename

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
            )

            page = browser.new_page(
                viewport={
                    "width": 1366,
                    "height": 768,
                }
            )

            page.goto(
                url,
                timeout=60000,
                wait_until="domcontentloaded",
            )

            page.screenshot(
                path=str(screenshot_path),
                full_page=True,
            )

            browser.close()

        return f"/static/screenshots/{filename}"

    except Exception as error:
        print("ERRO AO GERAR SCREENSHOT:")
        print(error)

        return None


@router.get("/scrape")
def scrape(
    url: str,
    db: Session = Depends(get_db),
):
    try:
        url = normalize_url(url)

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(
            url,
            headers=headers,
            timeout=15,
        )

        response.raise_for_status()

        soup = BeautifulSoup(
            response.text,
            "html.parser",
        )

        title = (
            soup.title.string.strip()
            if soup.title and soup.title.string
            else "Sem título"
        )

        description_tag = soup.find(
            "meta",
            attrs={"name": "description"},
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
            ],
        }

        screenshot_url = take_screenshot(url)

        item = ScrapingHistory(
            url=url,
            title=title,
            description=description,
            screenshot_url=screenshot_url,
        )

        db.add(item)
        db.commit()
        db.refresh(item)

        return {
            "id": item.id,
            "url": item.url,
            "title": item.title,
            "description": item.description,
            "screenshot_url": item.screenshot_url,
            "links_count": len(links),
            "images_count": len(images),
            "headings": headings,
            "links": links[:20],
            "images": images[:20],
        }

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
):
    return (
        db.query(ScrapingHistory)
        .order_by(ScrapingHistory.id.desc())
        .all()
    )


@router.delete("/history")
def clear_history(
    db: Session = Depends(get_db),
):
    db.query(ScrapingHistory).delete()
    db.commit()

    return {
        "message": "Histórico limpo com sucesso"
    }


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
        raise HTTPException(
            status_code=404,
            detail="Item não encontrado",
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Item deletado com sucesso"
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

    data = [
        {
            "id": item.id,
            "title": item.title,
            "url": item.url,
            "description": item.description,
            "screenshot_url": item.screenshot_url,
        }
        for item in history
    ]

    json_path = "webharvest_report.json"

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
        filename="webharvest_report.json",
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

    pdf = canvas.Canvas(
        pdf_path,
        pagesize=letter,
    )

    y = 750

    pdf.setFont(
        "Helvetica-Bold",
        18,
    )

    pdf.drawString(
        50,
        y,
        "WebHarvest Pro - Relatório",
    )

    y -= 40

    pdf.setFont(
        "Helvetica",
        11,
    )

    for item in history:
        pdf.drawString(
            50,
            y,
            f"ID: {item.id}",
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f"Título: {item.title}",
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f"URL: {item.url}",
        )

        y -= 20

        pdf.drawString(
            50,
            y,
            f"Screenshot: {item.screenshot_url}",
        )

        y -= 35

        if y < 80:
            pdf.showPage()
            y = 750

            pdf.setFont(
                "Helvetica",
                11,
            )

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
        "Screenshot",
    ])

    for item in history:
        sheet.append([
            item.id,
            item.title,
            item.url,
            item.description,
            item.screenshot_url,
        ])

    temp_file = NamedTemporaryFile(
        delete=False,
        suffix=".xlsx",
    )

    workbook.save(
        temp_file.name,
    )

    return FileResponse(
        path=temp_file.name,
        filename="webharvest_report.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )