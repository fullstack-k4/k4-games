import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateScore, getUserRank, getLeaderBoard } from "../controllers/gamescore.controller.js";


const router = Router();


router.route("/update").patch(verifyJWT, updateScore);
router.route("/getuserrank").get(verifyJWT, getUserRank);
router.route("/getleaderboard").get(verifyJWT, getLeaderBoard);

export default router;