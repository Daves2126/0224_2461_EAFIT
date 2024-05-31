import json
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
import os

def send_sentiment_analysis(body):
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

    sender_email = 'egonzalezt@eafit.edu.co'
    recipient_email = body['email']
    subject = 'Sentiment Analysis Result'
    template_id = 'd-df4b3c3d8424400685d41ef626eab913'

    template_data = {
        'email': body['email'],
        'sampleText': body['sampleText'],
        'result': body['result'],
    }

    message = Mail(
        from_email=Email(sender_email),
        to_emails=To(recipient_email),
        subject=subject,
        html_content=Content("text/html", "This is a fallback text")
    )

    message.template_id = template_id
    message.dynamic_template_data = template_data

    try:
        print("Sending mail")
        response = sg.send(message)
        print("Mail sent")
        return {
            'statusCode': response.status_code,
            'body': json.dumps('Email sent successfully!')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error sending email: {e}")
        }

def send_image_expression_analysis(body):
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

    sender_email = 'egonzalezt@eafit.edu.co'
    recipient_email = body['email']
    subject = 'Sentiment Analysis Result'
    template_id = 'd-e07c954e763d4003b5e216b83e33caf0'

    template_data = {
        'executionResult': body['result'],
        'url': body['signedUrl'],
    }

    message = Mail(
        from_email=Email(sender_email),
        to_emails=To(recipient_email),
        subject=subject,
        html_content=Content("text/html", "This is a fallback text")
    )

    message.template_id = template_id
    message.dynamic_template_data = template_data

    try:
        print("Sending mail")
        response = sg.send(message)
        print("Mail sent")
        return {
            'statusCode': response.status_code,
            'body': json.dumps('Email sent successfully!')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error sending email: {e}")
        }

def lambda_handler(event, context):
    # Extract records from the SQS event
    records = event.get('Records', [])

    # Process each record in the event
    for record in records:
        try:
            # Extract the body of the SQS message
            body_str = record.get('body', '{}')
            body = json.loads(body_str)

            # Extract the eventType from the message attributes
            message_attributes = record.get('messageAttributes', {})
            print(f"Message Attributes: {message_attributes}")  # Debug print
            eventType_attr = message_attributes.get('eventType', {})
            if isinstance(eventType_attr, dict):
                eventType = eventType_attr.get('stringValue', '')
            else:
                eventType = ''  # Default to empty string if not a dict

            print(f"Body: {body}")
            print(f"Event: {event}")
            print(f"EventType: {eventType}")

            # Call the appropriate function based on the eventType
            if eventType == 'sentimentAnalysis':
                return send_sentiment_analysis(body)
            elif eventType == 'imageExpressionAnalysis':
                return send_image_expression_analysis(body)
            else:
                print(f"Invalid eventType: {eventType}")
                return {
                    'statusCode': 400,
                    'body': json.dumps('Invalid eventType')
                }

        except Exception as e:
            print(f"Error processing record: {e}")
            return {
                'statusCode': 500,
                'body': json.dumps(f"Error processing record: {e}")
            }

    # Return a response if no records were processed
    return {
        'statusCode': 200,
        'body': json.dumps('No records to process')
    }
