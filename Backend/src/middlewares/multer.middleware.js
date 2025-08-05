import multer from "multer";
import multerS3 from 'multer-s3';
import { s3 } from "../config/dos3.js";
import { v4 as uuidv4 } from "uuid";
import { modifyfilename } from "../utils/modifyfilename.js"




// Multer S3 Storage Configuration
export const uploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    acl: "public-read",
    key: function (req, file, cb) {
      if (!req.uploadUuid) {
        req.uploadUuid = req.existingUniqueId || uuidv4().replace(/\D/g, "").substring(0, 5);
      }

      const originalName = file.originalname;

      const { extension, baseName } = modifyfilename(originalName);


      let finalFileName;
      if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed") {
        finalFileName = `files/${req.uploadUuid}/${baseName}.zip`;
      } else if (file.mimetype.startsWith("video/")) {
        finalFileName = `files/${req.uploadUuid}/bgiv/${baseName}${extension}`

      } else {
        finalFileName = `files/${req.uploadUuid}/${baseName}${extension}`;
      }
      cb(null, finalFileName);
    },
  }),
});



export const zipuploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    acl: "public-read",
    key: function (req, file, cb) {
      if (!req.uploadUuid) {
        req.uploadUuid = req.existingUniqueId || uuidv4().replace(/\D/g, "").substring(0, 5);
      }

      const originalName = file.originalname;

      const { extension, baseName } = modifyfilename(originalName);

      const finalFileName = `files/${req.uploadUuid}/${baseName}${extension}`;
      cb(null, finalFileName);
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
        req.uploadUuid = req.existingUniqueId || uuidv4().replace(/-/g, "").substring(0, 8);
      }
      const originalName = file.originalname;

      const { extension, baseName } = modifyfilename(originalName);

      const fieldFolderMap = {
        icon: "icon",
        image: "image"
      };

      const folder = fieldFolderMap[file.fieldname]
      const fileName = `gamecategory/${req.uploadUuid}/${folder}/${baseName}${extension}`;
      cb(null, fileName);
    },
  }),
});

export const PopupUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: function (req, file, cb) {
      if (!req.uploadUuid) {
        req.uploadUuid = req.existingUniqueId || uuidv4().replace(/-/g, "").substring(0, 8);
      }
      let folder = "image";
      const originalName = file.originalname;

      const { extension, baseName } = modifyfilename(originalName);

      const fileName = `popups/${req.uploadUuid}/${folder}/${baseName}${extension}`;
      cb(null, fileName);
    }
  })
})


export const AdbannerUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: function (req, file, cb) {
      if (!req.uploadUuid) {
        req.uploadUuid = req.existingUniqueId || uuidv4().replace(/-/g, "").substring(0, 8);
      }
      let folder = "image";
      const originalName = file.originalname;

      const { extension, baseName } = modifyfilename(originalName);

      const fileName = `adbanners/${req.uploadUuid}/${folder}/${baseName}${extension}`;
      cb(null, fileName);
    }
  })
})


export const MoreAppUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: function (req, file, cb) {
      if (!req.uploadUuid) {
        req.uploadUuid = req.existingUniqueId || uuidv4().replace(/-/g, "").substring(0, 8);
      }
      let folder = "image";

      const originalName = file.originalname;
      const { extension, baseName } = modifyfilename(originalName);
      const fileName = `moreapps/${req.uploadUuid}/${folder}/${baseName}${extension}`;
      cb(null, fileName);
    }
  })
})

export const AttachmentUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: function (req, file, cb) {

      let uniqueId = uuidv4().replace(/-/g, "").substring(0, 8);
      let folder = "attachment"
      const fileName = `userattachments/${uniqueId}/${folder}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10Mb
  },
})


export const featureduploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    acl: "public-read",
    key: function (req, file, cb) {
      if (!req.uploadUuid) {
        req.uploadUuid = req.existingUniqueId || uuidv4().replace(/\D/g, "").substring(0, 5);
      }

      const originalName = file.originalname;

      const { extension, baseName } = modifyfilename(originalName);

      const fileName = `files/${req.uploadUuid}/feat/${baseName}${extension}`;
      cb(null, fileName);
    },
  }),
});

export const recommendeduploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DIGITALOCEAN_BUCKET_NAME,
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    acl: "public-read",
    key: function (req, file, cb) {
      if (!req.uploadUuid) {
        req.uploadUuid = req.existingUniqueId || uuidv4().replace(/\D/g, "").substring(0, 5);
      }

      const originalName = file.originalname;

      const { extension, baseName } = modifyfilename(originalName);

      const fileName = `files/${req.uploadUuid}/recd/${baseName}${extension}`;
      cb(null, fileName);
    },
  }),
});



export const gameImageUploader = uploader.fields([
  { name: "gameZip", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 }
])

export const featuredImageVideoUploader = featureduploader.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "imageFile", maxCount: 1 }
])


export const categoryImageUploader = CategoryUploader.fields([
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 }
]);

export const gameUploader = zipuploader.single("gameZip");
export const popupImageUploader = PopupUploader.single("image");
export const adBannerImageUploader = AdbannerUploader.single("image");
export const moreappImageUploader = MoreAppUploader.single("image");
export const userAttachmentUploader = AttachmentUploader.single("attachment");
export const recommendedImageUploader = recommendeduploader.single("image");

