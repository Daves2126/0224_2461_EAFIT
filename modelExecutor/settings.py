import os
import logging

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(message)s", level=logging.INFO
)
AWS_REGION = os.getenv("AWS_REGION")
URL_SQS_ML = os.getenv("URL_SQS_ML")
API_URL = os.getenv("API_URL")
API_KEY = os.getenv("API_KEY")
URL_SQS_ML_NOTIFICATIONS = os.getenv("URL_SQS_ML_NOTIFICATIONS")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
