import boto3
import json
import logging
from text_sentiment import text_sentiment
from image_expression import image_expression
from settings import URL_SQS_ML_NOTIFICATIONS, AWS_REGION

sqs = boto3.client("sqs", region_name=AWS_REGION)


def lambda_handler(event, context):
    # Extract records from the SQS event
    records = event.get("Records", [])

    # Process each record in the event
    for record in records:
        try:
            body = json.loads(record.get("body", "{}"))
            logging.info(f"Mensaje recibido: {body}")

            result = {"email": body["email"]}
            event_type = "Unknown"

            if str(body["id"]) == "1":
                result.update(text_sentiment())
                event_type = "sentimentAnalysis"

            elif str(body["id"]) == "2":
                result.update(image_expression(body["signedUrl"], body["mimeType"]))
                event_type = "imageExpressionAnalysis"

            else:
                logging.error(f"Invalid id: {body['id']}")
                return {"statusCode": 400, "body": "Invalid id"}

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
            return {"statusCode": 200, "body": "OK"}
        except Exception as e:
            logging.error(f"Error processing record: {e}")
            return {
                "statusCode": 500,
                "body": f"Error processing record: {e}",
            }

    # Return a response if no records were processed
    return {"statusCode": 200, "body": "No records to process"}
