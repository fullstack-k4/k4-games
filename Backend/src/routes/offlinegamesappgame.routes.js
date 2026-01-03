import { Router } from "express";
import { verifyJWT, checkApiKey, verifyAdmin } from "../middlewares/auth.middleware.js";

import {
    upload, deleteGame, getById, getall, update,
    sendGameNotificationtoAllUsers, sendAdvertisementtoAllUsers,
    sendFavouriteGamesScreenNotificationToAllUsers, sendNotificationToAllUsers, uploadzip,
    getfileSignedUrl, getGameCategories, getGameZipSignedUrl
} from "../controllers/offlinegamesappgame.controller.js";

import { privatefileUploader } from "../middlewares/multer.middleware.js";
import { offlinegameImageUploader } from "../middlewares/multer.middleware.js";
import { extractOfflineGameUniqueId } from "../middlewares/extractUniqueId.js";

const router = Router();

router.route("/upload").post(verifyJWT, offlinegameImageUploader, upload);
router.route("/delete/:gameId").delete(verifyJWT, deleteGame);
router.route("/getall").get(checkApiKey, getall);
router.route("/get/:gameId").get(getById);
router.route("/getzipsignedurl").get(checkApiKey, getGameZipSignedUrl);
router.route("/update/:gameId").patch(verifyJWT, verifyAdmin, extractOfflineGameUniqueId, offlinegameImageUploader, update);
router.route("/sendnotification/all").post(verifyJWT, verifyAdmin, sendNotificationToAllUsers);
router.route("/sendadvertisementnotfication/all").post(verifyJWT, verifyAdmin, sendAdvertisementtoAllUsers);
router.route("/sendgamenotification/all").post(verifyJWT, verifyAdmin, sendGameNotificationtoAllUsers);
router.route("/sendfavouritegamesscreennotification/all").post(verifyJWT, verifyAdmin, sendFavouriteGamesScreenNotificationToAllUsers);
router.route("/upload/zip").post(privatefileUploader, uploadzip);
router.route("/signedurl").get(getfileSignedUrl);
router.route("/getcategories").get(checkApiKey, getGameCategories);





export default router;


