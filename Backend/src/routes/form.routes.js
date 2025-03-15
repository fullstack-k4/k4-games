import { Router } from "express";
import { verifyJWT,verifyAdmin,checkApiKey } from "../middlewares/auth.middleware.js";
import { createForm,deleteForm,getAllForms } from "../controllers/form.controller.js";
import {userAttachmentUploader} from "../middlewares/multer.middleware.js"

const router=Router();

router.route("/create").post(checkApiKey,userAttachmentUploader,createForm);
router.route("/delete/:id").delete(verifyJWT,verifyAdmin,deleteForm);
router.route("/getall").get(verifyJWT,verifyAdmin,getAllForms);


export default router;
