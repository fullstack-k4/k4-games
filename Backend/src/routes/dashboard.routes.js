import {Router} from "express";
import { dashboardData } from "../controllers/dashboard.controller.js";
import {verifyJWT,verifyAdmin} from "../middlewares/auth.middleware.js"
const router=Router();


router.route("/getall").get(verifyJWT,verifyAdmin,dashboardData);








export default router;