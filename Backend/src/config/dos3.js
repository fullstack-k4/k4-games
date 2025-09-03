import { S3Client } from "@aws-sdk/client-s3";


export const s3 = new S3Client({
  region: process.env.DIGITALOCEAN_REGION,
  endpoint: process.env.DIGITALOCEAN_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DIGITALOCEAN_BUCKET_ACESS_KEY_ID,
    secretAccessKey: process.env.DIGITALOCEAN_BUCKET_SECRET_KEY,
  },
});


