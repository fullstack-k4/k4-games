import { Router } from "express";
import { verifyJWT, verifyAdmin, checkApiKey } from "../middlewares/auth.middleware.js";
import { create, deleteById, getAll, getAllAdBanners } from "../controllers/adbanner.controller.js";
import { adBannerImageUploader } from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/create").post(verifyJWT, verifyAdmin, adBannerImageUploader, create);
router.route("/delete/:id").delete(verifyJWT, verifyAdmin, deleteById);
router.route("/getall").get(verifyJWT, verifyAdmin, getAll);
router.route("/getalladbanner").get(checkApiKey, getAllAdBanners);





export default router;





