import { Router } from "express";
import { verifyJWT,verifyAdmin } from "../middlewares/auth.middleware.js";
import {registerUser,loginUser,logoutUser,getCurrentUser,getAllSecondaryAdmin,deleteSecondaryAdmin} from "../controllers/user.controller.js";




const router=Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/getcurrentuser").get(verifyJWT,getCurrentUser);
router.route("/getAllSecondaryAdmin").get(verifyJWT,verifyAdmin,getAllSecondaryAdmin);
router.route("/deleteSecondaryAdmin/:secondaryAdminsId").delete(verifyJWT,verifyAdmin,deleteSecondaryAdmin);



export default router;