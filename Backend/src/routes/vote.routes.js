import Router from "express"
import { checkApiKey } from "../middlewares/auth.middleware.js"
import { VoteGame, checkVoteStatus, getLikedGames } from "../controllers/vote.controller.js";

const router = Router();


router.route("/game").post(checkApiKey, VoteGame);
router.route("/checkstatus").get(checkApiKey, checkVoteStatus);
router.route("/likedgames").get(checkApiKey, getLikedGames)


export default router;





