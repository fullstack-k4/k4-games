import { Router } from "express";
import { verifyJWT, checkApiKey } from "../middlewares/auth.middleware.js";
import {
    uploadGame, getAllGame,
    getGameById, deleteGame,
    editGame, incrementTopTenCount, updateLoadingState,
    getGameCategories, allowDownload, denyDownload,
    getTop10Games, getFeaturedGames, allowFeatured,
    denyFeatured, getRecommendedGames, allowRecommended,
    denyRecommended, getGameBySlug, getAllGameWeb,
    getPopularGames
} from "../controllers/game.controller.js";
import { gameImageUploader, gameUploader, featuredImageVideoUploader, recommendedImageUploader } from "../middlewares/multer.middleware.js";
import { extractUniqueId } from "../middlewares/extractUniqueId.js";
const router = Router();

router.route("/upload").post(verifyJWT, gameImageUploader, uploadGame);
router.route("/edit/:gameId").patch(verifyJWT, extractUniqueId, gameImageUploader, editGame);
router.route("/getall").get(checkApiKey, getAllGame);
router.route("/getallweb").get(checkApiKey, getAllGameWeb);
router.route("/get").get(checkApiKey, getGameById);
router.route("/getbyslug").get(checkApiKey, getGameBySlug);
router.route("/delete/:gameId").delete(verifyJWT, deleteGame);
router.route("/increment/").put(checkApiKey, incrementTopTenCount);
router.route("/updateLoadingState/").put(checkApiKey, updateLoadingState);
router.route("/getcategories").get(checkApiKey, getGameCategories);
router.route("/allowdownload/:gameId").patch(verifyJWT, extractUniqueId, gameUploader, allowDownload);
router.route("/denydownload/:gameId").patch(verifyJWT, denyDownload);
router.route("/gettop10games").get(checkApiKey, getTop10Games);
router.route("/getfeaturedgames").get(checkApiKey, getFeaturedGames);
router.route("/getrecommendedgames").get(checkApiKey, getRecommendedGames);
router.route("/allowfeatured/:gameId").patch(verifyJWT, extractUniqueId, featuredImageVideoUploader, allowFeatured);
router.route("/denyfeatured/:gameId").patch(verifyJWT, denyFeatured);
router.route("/allowrecommended/:gameId").patch(verifyJWT, extractUniqueId, recommendedImageUploader, allowRecommended);
router.route("/denyrecommended/:gameId").patch(verifyJWT, denyRecommended);
router.route("/getpopulargames").get(checkApiKey,getPopularGames);



export default router;