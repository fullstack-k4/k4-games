import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Game } from "../models/game.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { extractAndUpload } from "../utils/extractAndUpload.js";
import { deleteFileFromDO, deleteFolderFromS3, uploadJsonToS3 } from "../utils/do.js";
import { Category } from "../models/category.model.js";
import { Vote } from "../models/vote.model.js"

// UPLOAD GAME
const uploadGame = asyncHandler(async (req, res) => {
    const { gameName, description, category,
        splashColor, isrotate, slug,
        primaryCategory, instruction, gamePlayVideo,
        isDesktop, isAppOnly, isPremium,
        isHiddenWeb, isListed, topTenCount, likesCount, dislikesCount, status, scheduledAt, notify, notes } = req.body;

    const downloadable = req.body.downloadable === "true";


    let gameUrl = req.body.gameUrl || "";
    let imageUrl = req.body.imageUrl || "";
    let backgroundVideoUrl = req.body.backgroundVideoUrl || "";
    let gameSource;
    let thumbnailSource;
    let backgroundVideoSource;


    // input validation
    if ([gameName, description, splashColor, isrotate, slug, primaryCategory, isDesktop].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    if (!category) {
        throw new ApiError(400, "Category is required");
    }

    let extractedFiles = [];
    let uploadedGameUrl = req.files["gameZip"] ? req.files["gameZip"][0].location : null;

    if (uploadedGameUrl) {
        uploadedGameUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["gameZip"][0].key}`
    }


    if (uploadedGameUrl) {
        const uploadUuid = req.uploadUuid || uuidv4().replace(/-/g, "").substring(0, 5);
        const originalFileName = req.files["gameZip"][0].originalname.toLowerCase() // Convert to lowercase
            .replace(/\s+/g, "-") // Replace spaces with "-"
            .replace(/\.zip$/i, ""); // Remove .zip extension if present;
        extractedFiles = await extractAndUpload(uploadedGameUrl, uploadUuid, originalFileName);
        const indexHtmlFileLink = extractedFiles.filter((file) => file.fileName === "index.html");
        let gameLink = indexHtmlFileLink[0].url;
        const relativePath = gameLink.split(".com/")[1];
        gameUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${relativePath}`;
        gameSource = "self";
    }

    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;

    if (uploadedImageUrl) {
        imageUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["image"][0].key}`;
        thumbnailSource = "self";
    }

    let uploadedVideoUrl = req.files["video"] ? req.files["video"][0].location : null;

    if (uploadedVideoUrl) {
        backgroundVideoUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["video"][0].key}`;
        backgroundVideoSource = "self"
    }


    // if download not allowed delete zip folder
    if (!downloadable && uploadedGameUrl) {
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
        gameSource: gameSource === "self" ? "self" : "link",
        thumbnailSource: thumbnailSource === "self" ? "self" : "link",
        createdBy: req.user?._id,
        slug,
        primaryCategory,
        instruction,
        gamePlayVideo,
        backgroundVideoUrl,
        backgroundVideoSource,
        isDesktop,
        isAppOnly,
        isPremium,
        isHiddenWeb,
        isListed,
        topTenCount,
        likesCount,
        dislikesCount,
        status,
        scheduledAt: status === "scheduled" ? new Date(scheduledAt) : null,
        notify,
        notes
    };

    if (downloadable) {
        gameData.gameZipUrl = uploadedGameUrl;
    }



    let gameDataUrl;
    // Create Json File and Upload To Digital Ocean if Game is downloadable
    if (downloadable && uploadedGameUrl) {

        const matchedId = uploadedGameUrl.match(/files\/(\d+)\//);
        const matchedUId = matchedId[1];
        const gameId = matchedId ? parseInt(matchedId[1], 10) : null;

        const gameJson = {
            _id: gameId,
            gameName,
            description: description?.split(" ").slice(0, 10).join(" "),
            category: primaryCategory,
            splashColor,
            imageUrl,
            gameUrl,
            downloadable,
            isrotate: isrotate === "true",
            slug,
        };

        gameDataUrl = await uploadJsonToS3(matchedUId, gameJson);
    }


    const game = await Game.create({ ...gameData, gameDataUrl });

    return res.status(201).json(new ApiResponse(201, game, "Game Uploaded Succesfully"));
});

// EDIT:GAME
const editGame = asyncHandler(async (req, res) => {

    const { gameName, description, category,
        splashColor, slug, primaryCategory,
        instruction, gamePlayVideo, isDesktop,
        isAppOnly, isPremium, isHiddenWeb, isListed,
        topTenCount, likesCount, dislikesCount, status, scheduledAt, notify, notes } = req.body;

    const isrotate = req.body.isrotate === "true"
    let imageUrl = req.body.imageUrl || "";
    let gameUrl = req.body.gameUrl || "";
    let backgroundVideoUrl = req.body.backgroundVideoUrl || "";

    // input validation
    if ([gameName, description, splashColor, slug, isDesktop].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!category) {
        throw new ApiError(400, "Category is required");
    }

    let game = req.game;


    let downloadable = game?.downloadable;
    let gameZipUrl = game?.gameZipUrl;

    const previousGameUrl = game.gameUrl;
    const previousImageUrl = game.imageUrl;
    const previousBackgroundVideoUrl = game?.backgroundVideoUrl;
    const previousgameName = game?.gameName;
    const previousDescription = game?.description;
    const previousSplashColor = game?.splashColor;
    const previousOrientation = game?.isrotate;
    const previousPrimaryCategory = game?.primaryCategory;
    const previousSlug = game?.slug;




    let extractedFiles = [];
    let uploadedGameUrl = req.files["gameZip"] ? req.files["gameZip"][0].location : null;


    if (uploadedGameUrl) {
        uploadedGameUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["gameZip"][0].key}`
    }

    if (uploadedGameUrl) {
        const uploadUuid = req.uploadUuid || uuidv4().replace(/-/g, "").substring(0, 8);
        const originalFileName = req.files["gameZip"][0].originalname.toLowerCase() // Convert to lowercase
            .replace(/\s+/g, "-") // Replace spaces with "-"
            .replace(/\.zip$/i, ""); // Remove .zip extension if present;
        extractedFiles = await extractAndUpload(uploadedGameUrl, uploadUuid, originalFileName);
        const indexHtmlFileLink = extractedFiles.filter((file) => file.fileName === "index.html");
        let gameLink = indexHtmlFileLink[0].url;
        const relativePath = gameLink.split(".com/")[1];
        gameUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${relativePath}`;

        //Delete previous game folder
        if (game.gameSource === "self") {
            await deleteFolderFromS3(previousGameUrl);
        }

        // Delete previous game zip
        if (game?.gameZipUrl) {
            await deleteFileFromDO(game.gameZipUrl);
        }
    }

    if (!gameUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`) && previousGameUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`) && !uploadedGameUrl) {
        // which means game is edited via link and previous game was uploaded on cloud
        // delete previous game from cloud

        // Delete previous  game folder
        await deleteFolderFromS3(previousGameUrl);

        // Delete previous game zip 

        if (game?.gameZipUrl) {
            await deleteFileFromDO(game.gameZipUrl);
        }
        // delete gameData.json

        if (game?.gameDataUrl) {
            await deleteFileFromDO(gameDataUrl);
        }

        // reset these fields
        downloadable = false;
        gameZipUrl = null;
    }




    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;

    if (uploadedImageUrl) {
        imageUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["image"][0].key}`;

        // Delete previous image
        if (game.thumbnailSource === "self") {
            await deleteFileFromDO(previousImageUrl);
        }

    }

    if (!imageUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`) && previousImageUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`) && !uploadedImageUrl) {
        // which means image is edited via link and previous image was uploaded on cloud
        // delete previous image from cloud
        await deleteFileFromDO(previousImageUrl);

    }

    let uploadedVideoUrl = req.files["video"] ? req.files["video"][0].location : null;

    if (uploadedVideoUrl) {
        backgroundVideoUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["video"][0].key}`;

        // Delete previous video

        if (game?.backgroundVideoSource === "self") {
            await deleteFileFromDO(previousBackgroundVideoUrl);
        }

    }

    if (!backgroundVideoUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`) && previousBackgroundVideoUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`) && !uploadedVideoUrl) {
        // which means background video is edited via link and previous image was uploaded on cloud
        // delete previous video from cloud
        await deleteFileFromDO(previousBackgroundVideoUrl);
    }



    let gameDataUrl = game?.gameDataUrl;


    if (game?.downloadable) {
        if (!uploadedGameUrl && !uploadedImageUrl && (
            previousgameName !== gameName
            || previousDescription !== description ||
            previousSplashColor !== splashColor ||
            previousOrientation !== isrotate ||
            previousPrimaryCategory !== primaryCategory ||
            previousSlug !== slug
        )) {
            // delete previous gameData.json File 
            await deleteFileFromDO(game?.gameDataUrl);

            // create new meta data

            const matchedId = game.gameDataUrl.match(/files\/(\d+)\//);
            const matchedUId = matchedId[1];
            const gameId = matchedId ? parseInt(matchedId[1], 10) : null;


            const gameJson = {
                _id: gameId,
                gameName,
                description: description?.split(" ").slice(0, 10).join(" "),
                category: primaryCategory,
                splashColor,
                imageUrl,
                gameUrl,
                downloadable: true,
                isrotate,
                slug
            };

            gameDataUrl = await uploadJsonToS3(matchedUId, gameJson);
        }

        // this condition is because if new zip is uploaded or new image is uploaded and download is allowed it is must to upload new gameData.json file

        if (uploadedGameUrl || uploadedImageUrl) {
            // delete previous gameData.json File 
            await deleteFileFromDO(game.gameDataUrl);

            // create new meta data

            const matchedId = game.gameDataUrl.match(/files\/(\d+)\//);
            const matchedUId = matchedId[1];
            const gameId = matchedId ? parseInt(matchedId[1], 10) : null;


            const gameJson = {
                _id: gameId,
                gameName,
                description: description?.split(" ").slice(0, 10).join(" "),
                category: primaryCategory,
                splashColor,
                imageUrl,
                gameUrl,
                downloadable: true,
                isrotate,
                slug
            };

            gameDataUrl = await uploadJsonToS3(matchedUId, gameJson);


        }
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

    if (imageUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`)) {
        game.thumbnailSource = "self"
    }
    else {
        game.thumbnailSource = "link"
    }

    if (gameUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`)) {
        game.gameSource = "self"
    }
    else {
        game.gameSource = "link"
    }

    // when game is already downloadable  and new zip file got uploaded so we have to update gameZipUrl 
    if (downloadable && uploadedGameUrl) {
        gameZipUrl = uploadedGameUrl;
    }
    game.backgroundVideoUrl = backgroundVideoUrl;
    if (backgroundVideoUrl.includes(`${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}`)) {
        game.backgroundVideoSource = "self"
    }
    else {
        game.backgroundVideoSource = "link"
    }
    game.isrotate = isrotate;
    game.slug = slug
    game.primaryCategory = primaryCategory
    game.instruction = instruction
    game.gamePlayVideo = gamePlayVideo
    game.isDesktop = isDesktop
    game.isAppOnly = isAppOnly
    game.isPremium = isPremium
    game.gameDataUrl = gameDataUrl
    game.downloadable = downloadable
    game.gameZipUrl = gameZipUrl
    game.isHiddenWeb = isHiddenWeb
    game.isListed = isListed
    game.topTenCount = topTenCount
    game.likesCount = likesCount
    game.dislikesCount = dislikesCount
    game.notify = notify
    game.notes = notes

    if (status) {
        game.status = status;

        if (status === "scheduled") {
            game.scheduledAt = new Date(scheduledAt);
        } else {
            game.scheduledAt = null;
        }
    }


    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Game Updated Succesfully"));

})

// GET:ALL GAMES (FOR APP)
const getAllGame = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, category, sortBy, deviceType, filterBy } = req.query;

    const pipeline = [];

    pipeline.push({
        $match: {
            status: "published"
        }
    })

    pipeline.push({
        $match: {
            isListed: false
        }
    })

    if (filterBy === "downloadable") {
        pipeline.push({
            $match: {
                downloadable: true
            }
        })
    }


    if (deviceType && deviceType === "mobile") {
        pipeline.push({
            $match: {
                isDesktop: false
            }
        })
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


// GET:All GAMES WEB (FOR WEBSITE)
const getAllGameWeb = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, category, sortBy, filterBy, categoryName } = req.query;

    const pipeline = [];


    pipeline.push({
        $match: {
            status: "published"
        }
    })

    let foundCategory = null;


    if (filterBy && filterBy === "mobile") {
        pipeline.push({ $match: { isDesktop: false } });
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

    // in this case  i am sending slug of category
    if (category) {
        foundCategory = await Category.findOne({ slug: category });
        pipeline.push({
            $match: {
                category: { $in: [foundCategory?.name] }
            }
        })
    }

    // in this case i am sending original category name
    if (categoryName) {
        pipeline.push({
            $match: {
                category: { $in: [categoryName] }
            }
        })
    }

    if (sortBy === "newest") {
        pipeline.push({ $sort: { createdAt: -1 } });
    }
    else if (sortBy === "oldest") {
        pipeline.push({ $sort: { createdAt: 1 } });
    }
    else if (sortBy === "top") {
        pipeline.push({ $sort: { topTenCount: -1 } })
    }

    pipeline.push({
        $match: {
            $or: [
                { isHiddenWeb: { $exists: false } },
                { isHiddenWeb: false }
            ]
        }
    });


    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const game = await Game.aggregatePaginate(Game.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, { ...game, searchedcategory: foundCategory?.name, searchedcategoryimage: foundCategory?.imageUrl, searchedcategoryicon: foundCategory?.iconUrl, searchedcategorydescription: foundCategory?.description }, "All Games Fetched Successfully"));
});


// GET:ALL GAMES DASHBOARD (FOR DASHBOARD)
const getAllGameDashboard = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, category, userRole, userId, sortBy, filterBy, status } = req.query;

    const pipeline = [];

    if (userId && userRole !== "admin") {
        pipeline.push({
            $match: { createdBy: new mongoose.Types.ObjectId(userId) }
        });
    }

    if (status) {
        pipeline.push({
            $match: { status }
        })
        if (status === "scheduled") {
            pipeline.push({ $sort: { scheduledAt: 1 } })
        }
    }


    if (filterBy === "featured") {
        pipeline.push({
            $match: { isFeatured: true }
        })
    }


    if (filterBy === "downloadable") {
        pipeline.push({
            $match: { downloadable: true }
        })
    }

    if (filterBy === "recommended") {
        pipeline.push({
            $match: { isRecommended: true }
        })
    }

    if (filterBy === "desktoponly") {
        pipeline.push({
            $match: { isDesktop: true }
        })
    }

    if (filterBy === "apppromotion") {
        pipeline.push({
            $match: { isAppOnly: true }
        })
    }

    if (filterBy === "showonlyinapp") {
        pipeline.push({
            $match: { isHiddenWeb: true }
        })
    }

    if (filterBy === "listed") {
        pipeline.push({
            $match: { isListed: true }
        })
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

    if (sortBy === "newest" && status !== "scheduled") {
        pipeline.push({ $sort: { createdAt: -1 } });
    }
    else if (sortBy === "oldest") {
        pipeline.push({ $sort: { createdAt: 1 } });
    }


    if (filterBy === "featured") {
        pipeline.push({ $sort: { topTenCount: -1 } });
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const game = await Game.aggregatePaginate(Game.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, game, "All Games Fetched Successfully"));
});


// GET:TOP 10 GAMES (FOR APP)
const getTop10Games = asyncHandler(async (req, res) => {
    const { deviceType } = req.query;

    const filter = { status: "published", isListed: false };

    if (deviceType && deviceType === "mobile") {
        filter.isDesktop = false;
    }

    const top10games = await Game.find(filter).sort({ topTenCount: -1 }).limit(10);
    return res.status(200).json(new ApiResponse(200, top10games, "Top 10 Games Fetched Successfully"));
})


// GET:TOP 10 GAMES WEB
const getTop10GamesWeb = asyncHandler(async (req, res) => {
    const { filterBy } = req.query;

    const filter = {
        $or: [
            { isHiddenWeb: { $exists: false } },
            { isHiddenWeb: false }
        ]
    };

    filter.status = "published"

    if (filterBy === "mobile") {
        filter.isDesktop = false;
    }

    const top10games = await Game.find(filter)
        .sort({ topTenCount: -1 })
        .limit(10);

    return res
        .status(200)
        .json(new ApiResponse(200, top10games, "Top 10 Games Fetched Successfully"));
});


// GET: Popular Games
const getPopularGames = asyncHandler(async (req, res) => {
    const { filterBy } = req.query;

    const filter = {
        $or: [
            { isHiddenWeb: { $exists: false } },
            { isHiddenWeb: false }
        ]
    };

    filter.status = "published"

    if (filterBy === "mobile") {
        filter.isDesktop = false;
    }

    const getPopularGames = await Game.find(filter).select("gameName _id slug imageUrl").sort({ topTenCount: -1 }).limit(37);
    return res.status(200).json(new ApiResponse(200, getPopularGames, "Popular Games Fetched Successfully"));
})


// GET:FEATURED GAMES FOR APP
const getFeaturedGames = asyncHandler(async (req, res) => {
    const { deviceType } = req.query;

    const filter = { isFeatured: true, status: "published", isListed: false };

    if (deviceType && deviceType === "mobile") {
        filter.isDesktop = false;
    }

    const featuredGames = await Game.find(filter).sort({ topTenCount: -1 }).limit(7);
    return res.status(200).json(new ApiResponse(200, featuredGames, "Featured Games Fetched Successfully"));
})


// GET:FEATURED GAMES WEB
const getFeaturedGamesWeb = asyncHandler(async (req, res) => {
    const { filterBy } = req.query;

    const filter = {
        isFeatured: true,
        status: "published",
        $or: [
            { isHiddenWeb: { $exists: false } },
            { isHiddenWeb: false }
        ]
    }

    if (filterBy === "mobile") {
        filter.isDesktop = false;
    }

    const featuredGames = await Game.find(filter).sort({ topTenCount: -1 }).limit(7);
    return res.status(200).json(new ApiResponse(200, featuredGames, "Featured Games Fetched Successfully"));

})


// GET:RECOMMENDED GAMES FOR APP
const getRecommendedGames = asyncHandler(async (req, res) => {
    const { deviceType } = req.query;

    const filter = { isRecommended: true, status: "published", isListed: false };

    if (deviceType && deviceType === "mobile") {
        filter.isDesktop = false;
    }

    const recommendedGames = await Game.find(filter).limit(10);
    return res.status(200).json(new ApiResponse(200, recommendedGames, "Recommended Games Fetched Successfully"));
})


//GET:RECOMMENDED GAMES WEB
const getRecommendedGamesWeb = asyncHandler(async (req, res) => {
    const { filterBy } = req.query;

    const filter = {
        isRecommended: true,
        status: "published",
        $or: [
            { isHiddenWeb: { $exists: false } },
            { isHiddenWeb: false }
        ]
    }

    if (filterBy === "mobile") {
        filter.isDesktop = false;
    }


    const recommendedGames = await Game.find(filter).limit(10);
    return res.status(200).json(new ApiResponse(200, recommendedGames, "Recommended Games Fetched Successfully"));
})

// GET:BY ID
const getGameById = asyncHandler(async (req, res) => {
    const { _id, visitorId } = req.query;

    let vote;
    let isLiked;

    if (!isValidObjectId(_id)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    if (visitorId) {
        vote = await Vote.findOne({ gameId: _id, visitorId });
        isLiked = vote?.type === 'like';
    }

    const game = await Game.findById(_id);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    const gameData = game.toObject();

    if (visitorId) {
        gameData.isLiked = isLiked;
    }


    return res.status(200).json(new ApiResponse(200, gameData, "Game Fetched Successfully"));

})

// GET:BY SLUG
const getGameBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.query;

    const game = await Game.findOne({ slug });

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    // Calculating   total votes
    const totalVotes = await Vote.find({ gameId: game?._id }).countDocuments();

    const primaryCategory = await Category.findOne({ name: game?.primaryCategory }).select('iconUrl');
    const { iconUrl } = primaryCategory;


    // Calulating rating
    const likes = game?.likesCount || 0;
    const dislikes = game?.dislikesCount || 0;
    const total = likes + dislikes;

    const rating = total > 0 ? ((likes / total) * 10).toFixed(1) : 0;

    // Increment Top 10 Count

    game.topTenCount += 1;
    await game.save();

    return res.status(200).json(new ApiResponse(200, { ...game.toObject(), rating, totalVotes, primaryCategoryIcon: iconUrl }, "Game Fetched Successfully"));
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

    if (game?.gameSource === "self") {
        // delete game folder
        await deleteFolderFromS3(game.gameUrl);
    }

    // delete zip file
    if (game?.gameZipUrl) {
        await deleteFileFromDO(game.gameZipUrl);
    }

    if (game?.thumbnailSource === "self") {
        // delete thumbnail
        await deleteFileFromDO(game.imageUrl);
    }

    if (game?.backgroundVideoSource === "self") {
        // delete background video
        await deleteFileFromDO(game.backgroundVideoUrl);
    }

    if (game?.featuredImageUrl) {
        await deleteFileFromDO(game?.featuredImageUrl);
    }

    if (game?.featuredVideoUrl) {
        await deleteFileFromDO(game?.featuredVideoUrl);
    }

    if (game?.recommendedImageUrl) {
        await deleteFileFromDO(game?.recommendedImageUrl);
    }

    if (game?.gameDataUrl) {
        await deleteFileFromDO(game?.gameDataUrl);
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


    uploadedGameUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.file.key}`

    //Extract uuid
    const matchedId = uploadedGameUrl.match(/files\/(\d+)\//);
    const matchedUId = matchedId[1];
    const gameId = matchedId ? parseInt(matchedId[1], 10) : null;

    const gameJson = {
        _id: gameId,
        gameName: game?.gameName,
        description: game?.description?.split(" ").slice(0, 10).join(" "),
        category: game?.primaryCategory,
        splashColor: game?.splashColor,
        imageUrl: game?.imageUrl,
        gameUrl: game?.gameUrl,
        downloadable: true,
        isrotate: game?.isrotate,
        slug: game?.slug
    }

    // upload gameData.json file to digital ocean
    let gameDataUrl = await uploadJsonToS3(matchedUId, gameJson);

    if (uploadedGameUrl) {
        game.gameZipUrl = uploadedGameUrl;
    }
    game.downloadable = true;
    game.gameDataUrl = gameDataUrl;

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

    // delete gameData.json file
    if (game?.gameDataUrl) {
        await deleteFileFromDO(game?.gameDataUrl);
    }

    game.gameZipUrl = null;
    game.downloadable = false;

    if (game?.gameDataUrl) {
        game.gameDataUrl = "";
    }

    await game.save();
    return res.status(200).json(new ApiResponse(200, game, "Downloaded Deny Successfully"));

})

// ALLOW FEATURED
const allowFeatured = asyncHandler(async (req, res) => {
    let game = req.game;
    let featuredVideoUrl = req.body.featuredVideoUrl || "";
    let featuredImageUrl = req.body.featuredImageUrl || "";

    let uploadedImageUrl = req.files["imageFile"] ? req.files["imageFile"][0].location : null;
    let uploadedVideoUrl = req.files["videoFile"] ? req.files["videoFile"][0].location : null;

    if (uploadedImageUrl) {
        featuredImageUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["imageFile"][0].key}`;
    }
    if (uploadedVideoUrl) {
        featuredVideoUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["videoFile"][0].key}`;
    }

    // change the value of isFeatured to true

    game.isFeatured = true;

    // add the uploaded image and video to the game
    game.featuredVideoUrl = featuredVideoUrl;
    game.featuredImageUrl = featuredImageUrl;

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

    if (game?.featuredVideoUrl && game?.featuredVideoUrl.includes("/feat/")) {
        await deleteFileFromDO(game?.featuredVideoUrl);
        game.featuredVideoUrl = null;
    }

    if (game?.featuredImageUrl && game.featuredImageUrl.includes("/feat/")) {
        await deleteFileFromDO(game?.featuredImageUrl);
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

    let recommendedImageUrl = req.body.recommendedImageUrl || "";

    let uploadedImageUrl = req.file ? req.file.location : null;

    if (uploadedImageUrl) {
        recommendedImageUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.file.key}`;
    }


    // change the value of isRecommended to true;

    game.isRecommended = true;

    game.recommendedImageUrl = recommendedImageUrl;

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

    if (game?.recommendedImageUrl && game.recommendedImageUrl.includes("/recd/")) {
        await deleteFileFromDO(game?.recommendedImageUrl);
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


// CHECK SLUG AVAILABILITY
const checkSlugAvailability = asyncHandler(async (req, res) => {
    const { slug, gameId } = req.query;

    if (!slug) {
        return res.status.json({
            status: 400,
            message: "Slug is required"
        })
    }

    const slugFound = await Game.findOne({ slug });

    // If Slug is found and does not belong to the current game

    if (slugFound && slugFound._id.toString() !== gameId) {
        return res.status(200).json(new ApiResponse(200, true, "Slug already exists"));
    }

    // Slug is either not found or belongs to the same category
    return res.status(200).json(new ApiResponse(200, false, "Slug is available"));
})


export {
    uploadGame, getAllGame, getGameById,
    deleteGame, editGame, incrementTopTenCount,
    updateLoadingState, getGameCategories, allowDownload,
    denyDownload, getTop10Games, allowFeatured, denyFeatured,
    getFeaturedGames, allowRecommended, denyRecommended,
    getRecommendedGames, getGameBySlug, getAllGameWeb,
    getPopularGames, getFeaturedGamesWeb, getRecommendedGamesWeb,
    getAllGameDashboard, getTop10GamesWeb, checkSlugAvailability
};
