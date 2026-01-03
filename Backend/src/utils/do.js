import { DeleteObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/dos3.js";
import fs from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import mime from "mime-types";







const deleteFileFromDO = async (url) => {
  try {
    let s3Key = url.replace(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/`, "")

    const deleteParams = {
      Bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
      Key: s3Key,
    }

    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`File deleted: ${s3Key}`);

    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.log("Error deleting file:", error);
    throw new Error("Failed to delete file.");
  }

}




const deleteFileFromDOS3key = async (s3Key) => {
  try {

    console.log("Deleting file:", s3Key);

    const deleteParams = {
      Bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
      Key: s3Key,
    }
    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`File deleted: ${s3Key}`);
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.log("Error deleting file:", error);
    throw new Error("Failed to delete file")
  }
}

const uploadFileToS3 = async (
  filePath,
  s3Key,
  acl = "public-read"
) => {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
      Key: s3Key,
      Body: fs.createReadStream(filePath),
      ACL: acl,
      ContentType: mime.lookup(filePath) || "application/octet-stream",
    },
    queueSize: 4,
    partSize: 5 * 1024 * 1024,
    leavePartsOnError: false,
  });

  await upload.done();
};

const deleteFolderFromS3 = async (folderS3Key, filepath) => {
  try {
    const bucketName = process.env.DIGITALOCEAN_BUCKET_NAME;
    folderS3Key = folderS3Key.substring(folderS3Key.indexOf(`${filepath}`))

    if (folderS3Key.endsWith("index.html")) {
      folderS3Key = folderS3Key.slice(0, -"index.html".length);
    }

    console.log("printing folder key", folderS3Key);
    const prefix = folderS3Key
    // Step 1:List all files in the folder 
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const listedObjects = await s3.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log("No files found to delete");
      return;
    }

    // Step 2: Delete all listed files

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key })),
      }
    }

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await s3.send(deleteCommand);

    console.log("Game folder delete successfully from S3.");

  } catch (error) {
    console.log('Error deleting game folder from S3:', error);
  }
}


const uploadJsonToS3 = async (matchedId, gameJson, filepath) => {

  try {
    const jsonContent = Buffer.from(JSON.stringify(gameJson, null, 2), "utf-8");

    const uploadParams = {
      Bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
      Key: `${filepath}/${matchedId}/gameData.json`,
      Body: jsonContent,
      ACL: "public-read",
      ContentType: "application/json"
    }

    await s3.send(new PutObjectCommand(uploadParams));

    return `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${filepath}/${matchedId}/gameData.json`
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }

}


async function generateSignedUrl(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3, command, {
    expiresIn: 60 * 2
  });

}



export { deleteFileFromDO, uploadFileToS3, deleteFolderFromS3, deleteFileFromDOS3key, uploadJsonToS3, generateSignedUrl };