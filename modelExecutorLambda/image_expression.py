"""
Install the Google AI Python SDK

$ pip install google-generativeai

See the getting started guide for more information:
https://ai.google.dev/gemini-api/docs/get-started/python
"""

import os
import httpx
import logging
import tempfile
import google.generativeai as genai
from settings import model


def upload_to_gemini(s3_url, mime_type=None):
    # Download the image from the S3 URL
    response = httpx.get(s3_url)
    response.raise_for_status()  # Ensure the request was successful

    # Create a temporary file to save the image
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_file.write(response.content)
        tmp_file_path = tmp_file.name

    try:
        # Upload the temporary file to Gemini
        file = genai.upload_file(tmp_file_path, mime_type=mime_type)
        logging.info(f"Uploaded file '{file.display_name}' as: {file.uri}")
    finally:
        # Clean up the temporary file
        os.remove(tmp_file_path)

    return file


def image_expression(url: str, mime_type: str):
    image_drive = upload_to_gemini(url, mime_type=mime_type)
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(
        [
            image_drive,
            "Act as a sentiment face recognition system. Your input is an image of a person or character. Your output is the expression, example: 'Detected expression happy', if is not possible to analyze the image just say Unknown expression",
        ]
    )

    logging.info(f"Deleted {image_drive.display_name}.")

    return {"result": response.text, "signedUrl": url}
