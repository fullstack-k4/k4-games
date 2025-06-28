import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    registerUser, loginUser, logoutUser,
    getCurrentUser, getAllSecondaryAdmin, deleteSecondaryAdmin,
    sendNotificationToAllUsers, sendAdvertisementtoAllUsers,
    sendGameNotificationtoAllUsers
} from "../controllers/user.controller.js";




const router = Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/getcurrentuser").get(verifyJWT, getCurrentUser);
router.route("/getAllSecondaryAdmin").get(verifyJWT, verifyAdmin, getAllSecondaryAdmin);
router.route("/deleteSecondaryAdmin/:secondaryAdminsId").delete(verifyJWT, verifyAdmin, deleteSecondaryAdmin);
router.route("/sendnotification/all").post(verifyJWT, verifyAdmin, sendNotificationToAllUsers);
router.route("/sendadvertisementnotification/all").post(verifyJWT, verifyAdmin, sendAdvertisementtoAllUsers);
router.route("/sendgamenotification/all").post(verifyJWT,verifyAdmin,sendGameNotificationtoAllUsers)



export default router;