import Router from "express"
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js"
import { sendNotification, saveSubscription, sendNormalNotification, sendAdvertisementNotification } from "../controllers/webpushsubscription.controller.js"


const router = Router();


router.route("/save").post(saveSubscription);
router.route("/sendnotification").post(verifyJWT, verifyAdmin, sendNotification);
router.route("/sendnormalnotification").post(verifyJWT, verifyAdmin, sendNormalNotification);
router.route("/sendadvertisementnotification").post(verifyJWT, verifyAdmin, sendAdvertisementNotification)



export default router;