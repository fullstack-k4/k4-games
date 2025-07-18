import Router from "express"
import { checkApiKey } from "../middlewares/auth.middleware.js"
import { VoteGame,checkVoteStatus } from "../controllers/vote.controller.js";

const router = Router();


router.route("/game").post(checkApiKey, VoteGame);
router.route("/checkstatus").get(checkApiKey,checkVoteStatus);


export default router;





