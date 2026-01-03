import path from "path";
import unzipper from "unzipper";
import fs from "fs";
import axios from "axios";
import { deleteFileFromDOS3key,uploadFileToS3 } from "./do.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/dos3.js";




// Function to Download ZIP File
const downloadFile = async (url, destPath) => {
  const writer = fs.createWriteStream(destPath);
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream"
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};


// For Downloading Private Zip
export const downloadZipFromS3 = async (key, destPath) => {
  const command = new GetObjectCommand({
    Bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(destPath);
    response.Body.pipe(writeStream);
    response.Body.on("error", reject);
    writeStream.on("finish", resolve);
  });
};




// Function to Upload Folder (Recursive)

const uploadFolderToS3 = async (localFolderPath, s3BaseKey, uploadFiles = []) => {
  const items = fs.readdirSync(localFolderPath);

  for (const item of items) {
    const fullPath = path.join(localFolderPath, item);
    const s3Key = `${s3BaseKey}/${item}`;

    if (fs.statSync(fullPath).isDirectory()) {
      await uploadFolderToS3(fullPath, s3Key, uploadFiles);
    } else {
      await uploadFileToS3(fullPath, s3Key);

      uploadFiles.push({
        fileName: item,
        key: s3Key,
        url: `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${s3Key}`,
      });
    }
  }

  return uploadFiles;
};

// Extract & Upload Function
export const extractAndUpload = async (zipFileUrl, uploadUuid, originalFileName, filepath, privateFile) => {
  const tempDir = path.join(process.cwd(), `temp/${uploadUuid}`);
  const tempZipPath = path.join(tempDir, "game.zip");

  await fs.promises.mkdir(tempDir, { recursive: true });

  // Download ZIP first
  if (privateFile) {
    await downloadZipFromS3(zipFileUrl, tempZipPath)
  }
  else {
    await downloadFile(zipFileUrl, tempZipPath);
  }


  //  Extract ZIP
  await fs.createReadStream(tempZipPath).pipe(unzipper.Extract({ path: tempDir })).promise();

  //  Upload entire folder structure to S3
  const s3BaseKey = `${filepath}/${uploadUuid}/${originalFileName}`;

  const uploadedFiles = await uploadFolderToS3(tempDir, s3BaseKey);

  //  Cleanup
  await fs.promises.rm(tempDir, { recursive: true, force: true });

  const gameZipFiles3Key = `${filepath}/${uploadUuid}/${originalFileName}/game.zip`;

  await deleteFileFromDOS3key(gameZipFiles3Key);



  return uploadedFiles;
};



