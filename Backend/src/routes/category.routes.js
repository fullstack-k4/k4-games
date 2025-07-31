import { Router } from "express";
import { verifyJWT, verifyAdmin, checkApiKey } from "../middlewares/auth.middleware.js";
import {
    createCategory, getAllCategory, deleteCategory, getById, editCategory,
    getAllCategoryDashboard, getAllCategoriesDashboardPopup, getAllCategoryWeb,
    getAllCategoriesList
} from "../controllers/category.controller.js";
import { categoryImageUploader } from "../middlewares/multer.middleware.js";
import { extractCategoryUniqueId } from "../middlewares/extractUniqueId.js";

const router = Router();

router.route("/create").post(verifyJWT, verifyAdmin, categoryImageUploader, createCategory);
router.route("/getall").get(checkApiKey, getAllCategory);
router.route("/getallweb").get(checkApiKey, getAllCategoryWeb);
router.route("/getalllist").get(checkApiKey, getAllCategoriesList)
router.route("/getalldashboard").get(checkApiKey, getAllCategoryDashboard);
router.route("/getalldashboardpopup").get(checkApiKey, getAllCategoriesDashboardPopup);
router.route("/delete/:id").delete(verifyJWT, verifyAdmin, deleteCategory);
router.route("/get/:id").get(getById);
router.route("/edit/:categoryId").patch(verifyJWT, verifyAdmin, extractCategoryUniqueId, categoryImageUploader, editCategory)



export default router;