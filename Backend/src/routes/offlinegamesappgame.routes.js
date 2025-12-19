import { Router } from "express";
import { verifyJWT, checkApiKey, verifyAdmin } from "../middlewares/auth.middleware.js";

import { upload, deleteGame, getById, getall, update } from "../controllers/offlinegamesappgame.controller.js";

const router = Router();

router.route("/upload").post(verifyJWT, upload);
router.route("/delete/:gameId").delete(verifyJWT, deleteGame);
router.route("/getall").get(checkApiKey, getall);
router.route("/get/:gameId").get(getById);
router.route("/update/:gameId").patch(verifyJWT, verifyAdmin, update);





export default router;


