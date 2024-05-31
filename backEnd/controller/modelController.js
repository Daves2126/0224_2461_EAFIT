import { fromEnv } from "@aws-sdk/credential-providers";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { S3Client, PutObjectCommand, GetObjectCommand  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

import dotenv from "dotenv";
 
dotenv.config()

const getModels = async (req, res) => {
  
  const client = process.env.NODE_ENV == 'production' ? 
    new DynamoDBClient({ region: process.env.AWS_REGION }) : 
    new DynamoDBClient({ region: process.env.AWS_REGION, credentials: fromEnv() });

  const docClient = DynamoDBDocumentClient.from(client);
  const command = new ScanCommand({ TableName: "tb_models" });
  const response = await docClient.send(command);

  const models = response.Items.map(item => item);

  res.contentType = 'application/json';
  console.log(models);
  res.json(models);

  return res;
};

const getModelsById = async (req, res) => {
  const client = process.env.NODE_ENV == 'production' ? 
    new DynamoDBClient({ region: process.env.AWS_REGION }) : 
    new DynamoDBClient({ region: process.env.AWS_REGION, credentials: fromEnv() });

  const docClient = DynamoDBDocumentClient.from(client);
  const command = new GetCommand({
    TableName: "tb_models",
    Key: { id: req.params.id },
  });

  const response = await docClient.send(command);
  console.log(response.Item);
  res.json(response.Item)
  return res;
};

const postModel = async (req, res) => {
  const { id, email } = req.body;

  const sqsClient = process.env.NODE_ENV == 'production' ? 
    new SQSClient({ region: process.env.AWS_REGION }) : 
    new SQSClient({ region: process.env.AWS_REGION, credentials: fromEnv() });

  const queueUrl = process.env.SQS_QUEUE_URL;

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ id, email }),
  });

  try {
    const data = await sqsClient.send(command);
    res.status(200).json({ message: 'Message sent to SQS', messageId: data.MessageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending message to SQS', error: err.message });
  }
};


const postFormData = async (req, res) => {
  const { id, email, mimeType } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'File is required' });
  }

  const allowedMimeTypes = ['image/png', 'image/jpeg'];
  if (!allowedMimeTypes.includes(mimeType)) {
    return res.status(400).json({ message: 'Invalid mime type. Only image/png and image/jpeg are allowed.' });
  }

  const s3Client = process.env.NODE_ENV === 'production' ? 
    new S3Client({ region: process.env.AWS_REGION }) : 
    new S3Client({ region: process.env.AWS_REGION, credentials: fromEnv() });

  const bucketName = process.env.S3_BUCKET_NAME;
  const key = `${uuidv4()}.${file.originalname.split('.').pop()}`;

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: mimeType,
  });

  try {
    await s3Client.send(putCommand);

    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }), { expiresIn: 86400 });

    const sqsClient = process.env.NODE_ENV === 'production' ? 
      new SQSClient({ region: process.env.AWS_REGION }) : 
      new SQSClient({ region: process.env.AWS_REGION, credentials: fromEnv() });

    const queueUrl = process.env.SQS_QUEUE_URL;

    const messageBody = JSON.stringify({
      id,
      email,
      mimeType,
      signedUrl,
    });

    const sendCommand = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    });

    const data = await sqsClient.send(sendCommand);

    res.status(200).json({ message: 'File uploaded and message sent to SQS', messageId: data.MessageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading file or sending message to SQS', error: err.message });
  }
};

export { getModelsById, getModels, postModel, postFormData };
