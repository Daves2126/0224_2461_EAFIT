import boto3
import time
import json
import logging
from text_sentiment import text_sentiment
from image_expression import image_expression
from settings import URL_SQS_ML, URL_SQS_ML_NOTIFICATIONS, AWS_REGION

sqs = boto3.client("sqs", region_name=AWS_REGION)


def poll_sqs():
    while True:
        try:
            response = sqs.receive_message(
                QueueUrl=URL_SQS_ML, MaxNumberOfMessages=1, WaitTimeSeconds=10
            )

            messages = response.get("Messages", [])
            if messages:
                for message in messages:
                    logging.info(f"Mensaje recibido: {message['Body']}")
                    body = json.loads(message["Body"])

                    sqs.delete_message(
                        QueueUrl=URL_SQS_ML, ReceiptHandle=message["ReceiptHandle"]
                    )

                    result = {"email": body["email"]}
                    event_type = "Unknown"

                    if str(body["id"]) == "1":
                        result.update(text_sentiment())
                        event_type = "sentimentAnalysis"

                    elif str(body["id"]) == "2":
                        result.update(
                            image_expression(body["signedUrl"], body["mimeType"])
                        )
                        event_type = "imageExpressionAnalysis"

                    logging.info(f"Mensaje eliminado: {message['ReceiptHandle']}")
                    sqs.send_message(
                        QueueUrl=URL_SQS_ML_NOTIFICATIONS,
                        MessageBody=json.dumps(result),
                        MessageAttributes={
                            "eventType": {
                                "StringValue": event_type,
                                "DataType": "String",
                            }
                        },
                    )
            else:
                logging.debug("No hay mensajes en la cola.")
        except Exception as e:
            logging.error(f"Error: {e}")

        time.sleep(1)


if __name__ == "__main__":
    poll_sqs()
