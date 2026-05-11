import requests
from bs4 import BeautifulSoup

def scrape_website(url: str):

    response = requests.get(url)

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    title = soup.title.string if soup.title else "No title"

    return {
        "url": url,
        "title": title
    }