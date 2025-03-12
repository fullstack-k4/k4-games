import path from "path";
import unzipper from "unzipper";
import fs from "fs";
import axios from "axios";
import { uploadFileToS3 } from "./do.js";

// 📥 Function to Download ZIP File
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

// 📤 Function to Upload Folder (Recursive)
const uploadFolderToS3 = async (localFolderPath, s3BaseKey, uploadFiles = []) => {
  const items = fs.readdirSync(localFolderPath);

  for (const item of items) {
    const fullPath = path.join(localFolderPath, item);
    const s3Key = `${s3BaseKey}/${item}`; // Maintain folder structure

    if (fs.statSync(fullPath).isDirectory()) {
      // 📂 If directory, recursively upload its contents
      await uploadFolderToS3(fullPath, s3Key, uploadFiles);
    } else {
      // 📄 If file, upload it
      const uploadResult = await uploadFileToS3(fullPath, s3Key);
      uploadFiles.push({ fileName: item, url: uploadResult.Location });
    }
  }

  return uploadFiles;
};

// 📤 Extract & Upload Function
export const extractAndUpload = async (zipFileUrl, uploadUuid, originalFileName) => {
  const tempDir = path.join(process.cwd(), `temp/${uploadUuid}`);
  const tempZipPath = path.join(tempDir, "game.zip");

  await fs.promises.mkdir(tempDir, { recursive: true });

  // ✅ Download ZIP first
  await downloadFile(zipFileUrl, tempZipPath);

  // ✅ Extract ZIP
  await fs.createReadStream(tempZipPath).pipe(unzipper.Extract({ path: tempDir })).promise();

  // ✅ Upload entire folder structure to S3
  const s3BaseKey = `games/${uploadUuid}/game/${originalFileName}`;
  const uploadedFiles = await uploadFolderToS3(tempDir, s3BaseKey);

  // 🧹 Cleanup
  await fs.promises.rm(tempDir, { recursive: true, force: true });

  return uploadedFiles;
};


