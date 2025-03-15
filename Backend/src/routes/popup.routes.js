import {Router} from "express";
import { verifyJWT,verifyAdmin,checkApiKey } from "../middlewares/auth.middleware.js";
import { createPopUp, getAllPopUp,getPopUpById,deletePopup } from "../controllers/popup.controller.js";
import {popupImageUploader} from "../middlewares/multer.middleware.js";



const router=Router();


router.route("/create").post(verifyJWT,verifyAdmin,popupImageUploader,createPopUp);
router.route("/getall").get(checkApiKey,getAllPopUp);
router.route("/getById").get(checkApiKey,getPopUpById);
router.route("/delete/:id").delete(verifyJWT,verifyAdmin,deletePopup);






export default router;

