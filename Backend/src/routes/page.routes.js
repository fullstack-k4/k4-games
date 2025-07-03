import { Router } from "express";
import { create, getAll, deletePage, getBySlug, editPage } from "../controllers/page.controller.js";
import { verifyJWT, verifyAdmin, checkApiKey } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/create").post(verifyJWT, verifyAdmin, create);
router.route("/getall").get(checkApiKey, getAll);
router.route("/delete/:id").delete(verifyJWT, deletePage);
router.route("/getBySlug").get(checkApiKey, getBySlug);
router.route("/edit/:id").patch(verifyJWT, editPage)


export default router;

