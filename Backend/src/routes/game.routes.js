import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
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

router.route("/upload").post(verifyJWT, verifyAdmin, upload.fields([
    { name: "gameZip", maxCount: 1 },
    { name: "image", maxCount: 1 }
]), uploadGame);

router.route("/edit/:gameId").patch(verifyJWT, verifyAdmin, upload.fields([
    { name: "gameZip", maxCount: 1 },
    { name: "image", maxCount: 1 }
]), editGame)


router.route("/getall").get(verifyJWT, verifyAdmin, getAllGame);
router.route("/get/:gameId").get(verifyJWT, verifyAdmin, getGameById);
router.route("/delete/:gameId").delete(verifyJWT, verifyAdmin, deleteGame);
router.route("/download/:gameName").get(downloadGame);
router.route("/increment/:gameId").post(incrementTopTenCount);
router.route("/updateLoadingState/:gameId").put(updateLoadingState);
router.route("/getNumberOfTotalGames").get(verifyJWT, verifyAdmin, getNumberOfTotalGames);
router.route("/getNumberOfAllowedDownloadGames").get(verifyJWT, verifyAdmin, getNumberOfAllowedDownloadGames)
router.route("/getNumberOfSelfUploadedGames").get(verifyJWT,verifyAdmin,getNumberOfSelfUploadedGames)
router.route("/getNumberofUploadedGamesByLink").get(verifyJWT,verifyAdmin,getNumberofUploadedGamesByLink);
router.route("/getcategories").get(verifyJWT,getGameCategories);
router.route("/toggledownloadStatus/:gameId").patch(verifyJWT,toggleDownloadStatus);


export default router;