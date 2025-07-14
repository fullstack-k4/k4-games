import Router from "express"
import { checkApiKey } from "../middlewares/auth.middleware.js"
import { VoteGame } from "../controllers/vote.controller.js";

const router = Router();


router.route("/game").post(checkApiKey, VoteGame);


export default router;





