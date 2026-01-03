import { Router } from "express";
import { verifyJWT,verifyAdmin,checkApiKey } from "../middlewares/auth.middleware.js";
import { createCategory,getAllCategory,deleteCategory,getAllCategoriesList } from "../controllers/offlinegamesappcategory.controller.js";
import {offlinegamescategoryimageuploader} from "../middlewares/multer.middleware.js"


const router = Router();


router.route("/create").post(verifyJWT,verifyAdmin,offlinegamescategoryimageuploader,createCategory);
router.route("/getall").get(getAllCategory);
router.route("/getalllist").get(getAllCategoriesList)
router.route("/delete/:id").delete(verifyJWT,verifyAdmin,deleteCategory);



export default router;