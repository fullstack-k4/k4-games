import { Router } from "express";
import { verifyJWT, verifyAdmin, checkApiKey } from "../middlewares/auth.middleware.js";
import { getAllAdBannersWeb, create, deleteById, getAll } from "../controllers/adbannerweb.controller.js";
import { adBannerImageUploader } from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/create").post(verifyJWT, verifyAdmin, adBannerImageUploader, create);
router.route("/delete/:id").delete(verifyJWT, verifyAdmin, deleteById);
router.route("/getall").get(verifyJWT, verifyAdmin, getAll);
router.route("/getalladbannerweb").get(checkApiKey, getAllAdBannersWeb);





export default router;





