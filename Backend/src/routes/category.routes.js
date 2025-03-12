import {Router } from "express";
import {verifyJWT,verifyAdmin,checkApiKey} from "../middlewares/auth.middleware.js";
import { createCategory,getAllCategory,deleteCategory } from "../controllers/category.controller.js";
import { categoryImageUploader } from "../middlewares/multer.middleware.js";

const router=Router();

router.route("/create").post(verifyJWT,verifyAdmin,categoryImageUploader,createCategory);
router.route("/getall").get(checkApiKey,getAllCategory);
router.route("/delete/:id").delete(verifyJWT,verifyAdmin,deleteCategory);



export default router;