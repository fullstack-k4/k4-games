import {Router} from "express";
import {verifyJWT,verifyAdmin,checkApiKey} from "../middlewares/auth.middleware.js";
import { createReport,getAllReports,deleteReport } from "../controllers/report.controller.js";



const router=Router();
router.route("/create").post(checkApiKey,createReport);
router.route("/getall").get(verifyJWT,verifyAdmin,getAllReports);
router.route("/delete/:id").delete(verifyJWT,verifyAdmin,deleteReport);


export default router;