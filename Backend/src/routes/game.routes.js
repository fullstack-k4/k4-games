import { Router } from "express";
import { verifyJWT, verifyAdmin,checkApiKey } from "../middlewares/auth.middleware.js";
import {
    uploadGame, getAllGame,
    getGameById, deleteGame, downloadGame,
    editGame, incrementTopTenCount, updateLoadingState,
    getNumberOfTotalGames, getNumberOfAllowedDownloadGames,
    getNumberOfSelfUploadedGames,getNumberofUploadedGamesByLink,
    getGameCategories,toggleDownloadStatus
} from "../controllers/game.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload").post(verifyJWT, upload.fields([
    { name: "gameZip", maxCount: 1 },
    { name: "image", maxCount: 1 }
]), uploadGame);

router.route("/edit/:gameId").patch(verifyJWT, upload.fields([
    { name: "gameZip", maxCount: 1 },
    { name: "image", maxCount: 1 }
]), editGame)


router.route("/getall").get(verifyJWT,checkApiKey,getAllGame);
router.route("/get").get(verifyJWT,checkApiKey,getGameById);
router.route("/delete/:gameId").delete(verifyJWT,deleteGame);
router.route("/download/:gameName").get(downloadGame);
router.route("/increment/:gameId").post(checkApiKey,incrementTopTenCount);
router.route("/updateLoadingState/:gameId").put(checkApiKey,updateLoadingState);
router.route("/getNumberOfTotalGames").get(verifyJWT, verifyAdmin, getNumberOfTotalGames);
router.route("/getNumberOfAllowedDownloadGames").get(verifyJWT, verifyAdmin, getNumberOfAllowedDownloadGames)
router.route("/getNumberOfSelfUploadedGames").get(verifyJWT,verifyAdmin,getNumberOfSelfUploadedGames)
router.route("/getNumberofUploadedGamesByLink").get(verifyJWT,verifyAdmin,getNumberofUploadedGamesByLink);
router.route("/getcategories").get(verifyJWT,checkApiKey,getGameCategories);
router.route("/toggledownloadStatus/:gameId").patch(verifyJWT,checkApiKey,toggleDownloadStatus);


export default router;