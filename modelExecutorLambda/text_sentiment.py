import httpx
import logging
from settings import API_URL, API_KEY, model


def fetch_quote(api_url, api_key):
    response = httpx.get(api_url, headers={"X-Api-Key": api_key})
    response.raise_for_status()
    return response.json()[0]["quote"]


def text_sentiment():
    quote = fetch_quote(API_URL, API_KEY)
    logging.info(f"Quote: {quote}")
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(
        [
            f"Act as a sentiment text recognition system. Your input is a short text after 'Sample:'. Your output is the expression, example: 'Detected happy expression', if is not possible to analyze the image just say Unknown expression.\nSample: ${quote}",
        ]
    )
    logging.info(f"Sentiment: {response.text}")
    return {
        "sampleText": quote,
        "result": f"Sentiment: {response.text}",
    }
