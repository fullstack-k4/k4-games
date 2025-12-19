import { Router } from "express";
import { verifyJWT, checkApiKey, verifyAdmin } from "../middlewares/auth.middleware.js"

import {
    uploadGame, getAllGame, deleteGame,
    sendNotificationToAllUsers, sendAdvertisementtoAllUsers,
    sendGameNotificationtoAllUsers, sendNewGamesNotificationToAllUsers, sendSavedGamesNotificationToAllUsers
} from "../controllers/knifethrowgames.controller.js";

const router = Router();


router.route("/upload").post(verifyJWT, uploadGame);
router.route("/delete/:gameId").delete(verifyJWT, deleteGame);
router.route("/getall").get(checkApiKey, getAllGame);
router.route("/sendnotification/all").post(verifyJWT, verifyAdmin, sendNotificationToAllUsers);
router.route("/sendnewgamesnotification/all").post(verifyJWT, verifyAdmin, sendNewGamesNotificationToAllUsers);
router.route("/sendsavedgamesnotification/all").post(verifyJWT, verifyAdmin, sendSavedGamesNotificationToAllUsers);
router.route("/sendadvertisementnotfication/all").post(verifyJWT, verifyAdmin, sendAdvertisementtoAllUsers);
router.route("/sendgamenotification/all").post(verifyJWT, verifyAdmin, sendGameNotificationtoAllUsers)




export default router;