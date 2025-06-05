import { DeleteObjectCommand ,PutObjectCommand,ListObjectsV2Command,DeleteObjectsCommand} from "@aws-sdk/client-s3";
import {s3} from "../config/dos3.js";
import fs from "fs";
import mime from "mime-types"; 



const deleteFileFromDO=async(fileUrl)=>{
    try {
        const bucketName=process.env.DIGITALOCEAN_BUCKET_NAME;
        const gamesIndex = fileUrl.indexOf("files/");
        let s3Key;

        if(gamesIndex !== -1){
          // Extract the key (path after the bucket name)
          s3Key = fileUrl.substring(fileUrl.indexOf("files/"));
          s3Key=decodeURIComponent(s3Key);
        }
        else{
          s3Key = fileUrl.substring(fileUrl.indexOf("gamecategory/"));
          s3Key=decodeURIComponent(s3Key);
        }
        console.log("Deleting file:",s3Key);

        const deleteParams={
            Bucket:bucketName,
            Key:s3Key,
        }

        const response=await s3.send(new DeleteObjectCommand(deleteParams));
        console.log(`File deleted: ${s3Key}`);
        return {success:true,message:"File deleted successfully"};
    } catch (error) {
        console.log("Error deleting file:",error);
        throw new Error("Failed to delete file");
    }
}

const deleteFileFromDOS3key=async(s3Key)=>{
  try {
    
    console.log("Deleting file:",s3Key);

    const deleteParams={
      Bucket:process.env.DIGITALOCEAN_BUCKET_NAME,
      Key:s3Key,
    }
    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`File deleted: ${s3Key}`);
    return {success:true,message:"File deleted successfully"};
  } catch (error) {
    console.log("Error deleting file:",error);
    throw new Error("Failed to delete file")
  }
}

 const uploadFileToS3 = async (filePath, s3Key) => {
    try {
      const fileStream = fs.createReadStream(filePath);
  
      const uploadParams = {
        Bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ACL: "public-read",
        ContentType: mime.lookup(filePath) || "application/octet-stream", // Automatically set MIME type
      };
  
      await s3.send(new PutObjectCommand(uploadParams));
      return { Location: `${process.env.DIGITALOCEAN_ENDPOINT}/${s3Key}` };
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  }

  const deleteFolderFromS3=async(folderS3Key)=>{
    try {
      const bucketName=process.env.DIGITALOCEAN_BUCKET_NAME;
      folderS3Key=folderS3Key.substring(folderS3Key.indexOf("files/"))

      if (folderS3Key.endsWith("index.html")) {
        folderS3Key = folderS3Key.slice(0, -"index.html".length);
       }

       console.log("printing folder key",folderS3Key);
      const prefix=folderS3Key
      // Step 1:List all files in the folder 
      const listCommand=new ListObjectsV2Command({
        Bucket:bucketName,
        Prefix:prefix,
      });

      const listedObjects=await s3.send(listCommand);

      if(!listedObjects.Contents || listedObjects.Contents.length === 0){
        console.log("No files found to delete");
        return;
      }

      // Step 2: Delete all listed files

      const deleteParams={
        Bucket:bucketName,
        Delete:{
          Objects:listedObjects.Contents.map(obj=>({Key:obj.Key})),
        }
      }

      const deleteCommand=new DeleteObjectsCommand(deleteParams);
      await s3.send(deleteCommand);

      console.log("Game folder delete successfully from S3.");
      
    } catch (error) {
      console.log('Error deleting game folder from S3:',error);
    }
  }



export {deleteFileFromDO,uploadFileToS3,deleteFolderFromS3,deleteFileFromDOS3key};