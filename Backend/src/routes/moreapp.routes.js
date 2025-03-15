import {Router} from "express";
import { verifyJWT,verifyAdmin,checkApiKey } from "../middlewares/auth.middleware.js";
import { createApp,deleteApp,getAllApp } from "../controllers/moreapp.controller.js";
import { moreappImageUploader } from "../middlewares/multer.middleware.js";



const router=Router();



router.route("/create").post(verifyJWT,verifyAdmin,moreappImageUploader,createApp);
router.route("/getall").get(checkApiKey,getAllApp);
router.route("/delete/:id").delete(verifyJWT,verifyAdmin,deleteApp);



export default router;