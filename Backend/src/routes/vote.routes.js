import Router from "express"
import { VoteGame, checkVoteStatus, getLikedGames } from "../controllers/vote.controller.js";

const router = Router();


router.route("/game").post( VoteGame);
router.route("/checkstatus").get( checkVoteStatus);
router.route("/likedgames").get( getLikedGames)


export default router;





