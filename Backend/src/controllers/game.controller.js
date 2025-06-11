import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Game } from "../models/game.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { extractAndUpload } from "../utils/extractAndUpload.js";
import { deleteFileFromDO, deleteFolderFromS3, deleteFileFromDOS3key } from "../utils/do.js";


// UPLOAD GAME
const uploadGame = asyncHandler(async (req, res) => {
    const { gameName, description, category, splashColor, isrotate, slug } = req.body;

    // validating slug

    const slugFound = await Game.findOne({ slug });

    if (slugFound) {
        throw new ApiError(400, "Slug Already Exists");
    }

    let gameUrl = req.body.gameUrl || "";
    let imageUrl = req.body.imageUrl || "";
    let gameSource;
    let thumbnailSource;
    //  ensuring boolean value


    const downloadable = req.body.downloadable === "true";

    // input validation
    if ([gameName, description, splashColor, isrotate, slug].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    if (!category) {
        throw new ApiError(400, "Category is required");
    }

    let extractedFiles = [];
    let uploadedGameUrl = req.files["gameZip"] ? req.files["gameZip"][0].location : null;

    if (uploadedGameUrl) {
        const uploadUuid = req.uploadUuid || uuidv4().replace(/-/g, "").substring(0, 5);
        const originalFileName = req.files["gameZip"][0].originalname.toLowerCase() // Convert to lowercase
            .replace(/\s+/g, "-") // Replace spaces with "-"
            .replace(/\.zip$/i, ""); // Remove .zip extension if present;
        extractedFiles = await extractAndUpload(uploadedGameUrl, uploadUuid, originalFileName);
        const indexHtmlFileLink = extractedFiles.filter((file) => file.fileName === "index.html");
        let gameLink = indexHtmlFileLink[0].url;
        gameUrl = gameLink.replace(`https://${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com`, `https://${process.env.DIGITALOCEAN_BUCKET_NAME}.${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com`);
        gameSource = "self";
    }

    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;

    if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
        thumbnailSource = "self";
    }


    // if download not allowed delete zip folder
    if (!downloadable && req.body.downloadable !== "") {
        await deleteFileFromDO(uploadedGameUrl);
    }

    // Create game object
    let gameData = {
        gameName,
        description,
        category,
        splashColor,
        isrotate: isrotate === "true",
        imageUrl,
        gameUrl,
        downloadable,
        gameSource,
        thumbnailSource,
        createdBy: req.user?._id,
        slug
    };

    if (downloadable) {
        gameData.gameZipUrl = uploadedGameUrl;
    }

    const game = await Game.create(gameData);

    return res.status(201).json(new ApiResponse(201, game, "Game Uploaded Succesfully"));
});

// EDIT:GAME
const editGame = asyncHandler(async (req, res) => {

    const { gameName, description, category, splashColor, slug } = req.body;

    const isrotate = req.body.isrotate === "true"
    let imageUrl = req.body.imageUrl || "";
    let gameUrl = req.body.gameUrl || "";



    // input validation
    if ([gameName, description, splashColor, slug].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!category) {
        throw new ApiError(400, "Category is required");
    }

    let game = req.game;

    // validating slug
    const slugFound = await Game.findOne({ slug: slug, _id: { $ne: game._id } });

    if (slugFound) {
        throw new ApiError(400, "Slug Already Exists");
    }

    const downloadable = game.downloadable;

    const previousGameUrl = game.gameUrl;
    const previousImageUrl = game.imageUrl;

    let thumbnailSource = game.thumbnailSource;
    let gameSource = game.gameSource;


    let extractedFiles = [];
    let uploadedGameUrl = req.files["gameZip"] ? req.files["gameZip"][0].location : null;

    if (uploadedGameUrl) {
        const uploadUuid = req.uploadUuid || uuidv4().replace(/-/g, "").substring(0, 8);
        const originalFileName = req.files["gameZip"][0].originalname.toLowerCase() // Convert to lowercase
            .replace(/\s+/g, "-") // Replace spaces with "-"
            .replace(/\.zip$/i, ""); // Remove .zip extension if present;
        extractedFiles = await extractAndUpload(uploadedGameUrl, uploadUuid, originalFileName);
        const indexHtmlFileLink = extractedFiles.filter((file) => file.fileName === "index.html");
        let gameLink = indexHtmlFileLink[0].url;
        gameUrl = gameLink.replace(`https://${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com`, `https://${process.env.DIGITALOCEAN_BUCKET_NAME}.${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com`);
        gameSource = "self";

        //Delete previous game folder
        await deleteFolderFromS3(previousGameUrl);
        // Delete previous game zip
        if (game?.gameZipUrl) {
            await deleteFileFromDO(game.gameZipUrl);
        }
    }

    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;

    if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
        thumbnailSource = "self";

        // Delete previous image
        await deleteFileFromDO(previousImageUrl);
    }

    if (uploadedGameUrl && !downloadable) {
        // if the game is not downloadable , delete the uploaded game zip
        await deleteFileFromDO(uploadedGameUrl);
    }

    game.gameName = gameName;
    game.description = description;
    game.category = category;
    game.splashColor = splashColor;
    game.imageUrl = imageUrl;
    game.gameUrl = gameUrl;
    game.thumbnailSource = thumbnailSource;
    game.gameSource = gameSource;
    if (downloadable && uploadedGameUrl) {
        game.gameZipUrl = uploadedGameUrl;
    }
    game.isrotate = isrotate;
    game.slug = slug


    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Game Updated Succesfully"));

})

// GET:ALL GAMES
const getAllGame = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, category, userRole, userId, sortBy } = req.query;

    const pipeline = [];

    if (userId && userRole !== "admin") {
        pipeline.push({
            $match: { createdBy: new mongoose.Types.ObjectId(userId) }
        });
    }

    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { gameName: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    if (category) {
        pipeline.push({
            $match: {
                category: { $in: [category] }
            }
        })
    }

    if (sortBy === "newest") {
        pipeline.push({ $sort: { createdAt: -1 } });
    }
    else if (sortBy === "oldest") {
        pipeline.push({ $sort: { createdAt: 1 } });
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const game = await Game.aggregatePaginate(Game.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, game, "All Games Fetched Successfully"));
});

// GET:TOP 10 GAMES
const getTop10Games = asyncHandler(async (_, res) => {
    const top10games = await Game.find({}).sort({ topTenCount: -1 }).limit(10);
    return res.status(200).json(new ApiResponse(200, top10games, "Top 10 Games Fetched Successfully"));
})

// GET:FEATURED GAMES
const getFeaturedGames = asyncHandler(async (_, res) => {
    const featuredGames = await Game.find({ isFeatured: true }).limit(5);
    return res.status(200).json(new ApiResponse(200, featuredGames, "Featured Games Fetched Successfully"));
})

// GET:RECOMMENDED GAMES

const getRecommendedGames = asyncHandler(async (_, res) => {
    const recommendedGames = await Game.find({ isRecommended: true }).limit(10);
    return res.status(200).json(new ApiResponse(200, recommendedGames, "Recommended Games Fetched Successfully"));
})

// GET:BY ID
const getGameById = asyncHandler(async (req, res) => {
    const { _id } = req.query;

    if (!isValidObjectId(_id)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await Game.findById(_id);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }
    return res.status(200).json(new ApiResponse(200, game, "Game Fetched Successfully"));

})

// DELETE:GAME
const deleteGame = asyncHandler(async (req, res) => {

    const { gameId } = req.params;

    if (!isValidObjectId) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await Game.findById(gameId);

    if (game.createdBy !== req.user?._id && !req.user.role === "admin") {
        throw new ApiError(403, "You are not authorized to delete this game");
    }

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    await Game.findByIdAndDelete(gameId);

    if (game.gameSource === "self") {
        // delete game folder
        await deleteFolderFromS3(game.gameUrl);
    }

    // delete zip file
    if (game?.gameZipUrl) {
        await deleteFileFromDO(game.gameZipUrl);
    }

    if (game.thumbnailSource === "self") {
        // delete thumbnail
        await deleteFileFromDO(game.imageUrl);
    }

    if (game?.featuredImageUrl) {
        let imageS3Key = game.featuredImageUrl.replace(`https://${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com/${process.env.DIGITALOCEAN_BUCKET_NAME}/`, "");
        await deleteFileFromDOS3key(imageS3Key);
    }

    if (game?.featuredVideoUrl) {
        let videoS3Key = game.featuredVideoUrl.replace(`https://${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com/${process.env.DIGITALOCEAN_BUCKET_NAME}/`, "");
        await deleteFileFromDOS3key(videoS3Key);
    }

    if (game?.recommendedImageUrl) {
        let imageS3Key = game.recommendedImageUrl.replace(`https://${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com/${process.env.DIGITALOCEAN_BUCKET_NAME}/`, "");
        await deleteFileFromDOS3key(imageS3Key);
    }

    return res.status(200).json(new ApiResponse(200, game, "Game Deleted Succesfully"));
})

// GET:GAME CATEGORIES
const getGameCategories = asyncHandler(async (req, res) => {

    const categories = await Game.aggregate([
        { $unwind: "$category" },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])

    return res.status(200).json(new ApiResponse(200, categories, "Categories Fetched Succesfully"))

})

// ALLOW DOWNLOAD
const allowDownload = asyncHandler(async (req, res) => {

    let game = req.game;

    let uploadedGameUrl = req.file ? req.file.location : null;

    if (uploadedGameUrl) {
        game.gameZipUrl = uploadedGameUrl;
    }
    game.downloadable = true;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Downloaded Allowed Successfully"));
})

// DENY DOWNLOAD
const denyDownload = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await Game.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    // delete game zip
    await deleteFileFromDO(game.gameZipUrl);

    game.gameZipUrl = null;
    game.downloadable = false;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Downloaded Deny Successfully"));

})

// ALLOW FEATURED
const allowFeatured = asyncHandler(async (req, res) => {
    let game = req.game;

    let uploadedImageUrl = req.files["imageFile"] ? req.files["imageFile"][0].location : null;
    let uploadedVideoUrl = req.files["videoFile"] ? req.files["videoFile"][0].location : null;

    // change the value of isFeatured to true

    game.isFeatured = true;

    // add the uploaded image and video to the game
    game.featuredVideoUrl = uploadedVideoUrl;
    game.featuredImageUrl = uploadedImageUrl;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Allowed Featured Successfully"));

})

// DENY FEATURED
const denyFeatured = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await Game.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found")
    }



    // delete video and image

    if (game?.featuredVideoUrl) {
        let videoS3Key = game.featuredVideoUrl.replace(`https://${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com/${process.env.DIGITALOCEAN_BUCKET_NAME}/`, "");
        await deleteFileFromDOS3key(videoS3Key);
        game.featuredVideoUrl = null;
    }

    if (game?.featuredImageUrl) {
        let imageS3Key = game.featuredImageUrl.replace(`https://${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com/${process.env.DIGITALOCEAN_BUCKET_NAME}/`, "");
        await deleteFileFromDOS3key(imageS3Key);
        game.featuredImageUrl = null;
    }


    // change the value of isFeatured to false;
    game.isFeatured = false;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Deny Featured Successfully"))

})

// ALLOW RECOMMENDED
const allowRecommended = asyncHandler(async (req, res) => {
    let game = req.game;

    let uploadedImageUrl = req.file ? req.file.location : null;

    // change the value of isRecommended to true;

    game.isRecommended = true;

    game.recommendedImageUrl = uploadedImageUrl;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Allowed Recommended Successfully"));
})


// DENY RECOMMENDED
const denyRecommended = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game ID");
    }

    const game = await Game.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    if (game?.recommendedImageUrl) {
        let imageS3Key = game.recommendedImageUrl.replace(`https://${process.env.DIGITALOCEAN_REGION}.digitaloceanspaces.com/${process.env.DIGITALOCEAN_BUCKET_NAME}/`, "");
        await deleteFileFromDOS3key(imageS3Key);
        game.recommendedImageUrl = null;
    }

    game.isRecommended = false;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Denied Recommended Successfully"));
})


// INCREMENT TOP TEN COUNT
const incrementTopTenCount = asyncHandler(async (req, res) => {
    const { _id } = req.query;

    if (!isValidObjectId(_id)) {
        throw new ApiError(404, "Invalid Game Id");
    }

    const game = await Game.findById(_id);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    // Increment the topTenCount by 1
    game.topTenCount += 1;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "topTenCount Incremented Successfully"));
});

// UPDATE LOADING STATE
const updateLoadingState = asyncHandler(async (req, res) => {
    const { _id } = req.query;
    const { isloading } = req.query;

    if (!isValidObjectId(_id)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    if (!isloading) {
        throw new ApiError(400, "isloading is required");
    }

    const game = await Game.findById(_id);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    if (typeof isloading !== 'string' || (isloading !== 'true' && isloading !== 'false')) {
        throw new ApiError(400, "Invalid value for isloading. It must be true or false");
    }

    // Update the isloading value
    game.isloading = (isloading === 'true');

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "is loaded updated Succesfully"));
})


export {
    uploadGame, getAllGame, getGameById,
    deleteGame, editGame, incrementTopTenCount,
    updateLoadingState, getGameCategories, allowDownload,
    denyDownload, getTop10Games, allowFeatured, denyFeatured,
    getFeaturedGames, allowRecommended, denyRecommended,
    getRecommendedGames
};
