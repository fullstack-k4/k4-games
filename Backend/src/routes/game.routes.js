import { Router } from "express";
import { verifyJWT,checkApiKey } from "../middlewares/auth.middleware.js";
import {
    uploadGame, getAllGame,
    getGameById, deleteGame,
    editGame, incrementTopTenCount, updateLoadingState,
    getGameCategories,allowDownload,denyDownload
} from "../controllers/game.controller.js";
import {gameImageUploader,gameUploader} from "../middlewares/multer.middleware.js";
import { extractUniqueId } from "../middlewares/extractUniqueId.js";
const router = Router();

router.route("/upload").post(verifyJWT,gameImageUploader,uploadGame);
router.route("/edit/:gameId").patch(verifyJWT,extractUniqueId,gameImageUploader,editGame);
router.route("/getall").get(checkApiKey,getAllGame);
router.route("/get").get(checkApiKey,getGameById);
router.route("/delete/:gameId").delete(verifyJWT,deleteGame);
router.route("/increment/").put(checkApiKey,incrementTopTenCount);
router.route("/updateLoadingState/").put(checkApiKey,updateLoadingState);
router.route("/getcategories").get(verifyJWT,checkApiKey,getGameCategories);
router.route("/allowdownload/:gameId").patch(verifyJWT,extractUniqueId,gameUploader,allowDownload);
router.route("/denydownload/:gameId").patch(verifyJWT,denyDownload);

export default router;