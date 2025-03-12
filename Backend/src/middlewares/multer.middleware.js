import multer from "multer";
import multerS3 from 'multer-s3';
import {s3} from "../config/dos3.js";
import {v4 as uuidv4} from "uuid";




// Multer S3 Storage Configuration
export const uploader= multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: function (req, file, cb) {
      cb(null, file.mimetype); 
    },
    acl: "public-read",
    key: function (req, file, cb) {
      if (!req.uploadUuid) {
        req.uploadUuid =req.existingUniqueId || uuidv4().replace(/-/g, "").substring(0, 8);
      }
      let folder = file.mimetype.startsWith("image") ? "image" : "game";
       // Process the filename:
       let fileName = file.originalname
       .toLowerCase() // Convert to lowercase
       .replace(/\s+/g, "-") // Replace spaces with "-"
       .replace(/\.zip$/i, ""); // Remove .zip extension if present
      const finalFileName  = `games/${req.uploadUuid}/${folder}/${Date.now()}-${fileName}`;
      cb(null, finalFileName );
    },
  }),
});



export const CategoryUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: function (req, file, cb) {

      if (!req.uploadUuid) {
        req.uploadUuid =req.existingUniqueId || uuidv4().replace(/-/g, "").substring(0, 8);
      }

      let folder = "image"
      const fileName = `gamecategory/${req.uploadUuid}/${folder}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

export const gameImageUploader=uploader.fields([
  {name:"gameZip",maxCount:1},
  {name:"image",maxCount:1}
])


export const gameUploader=uploader.single("gameZip");

export const categoryImageUploader=CategoryUploader.single("image");
