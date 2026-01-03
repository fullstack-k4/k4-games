import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { offlinegamesappGame } from "../models/offlinegamesappgame.model.js"
import { isValidObjectId } from "mongoose";
import admin from "../config/offlinegamesfirebaseConfig.js";
import { generateSignedUrl, uploadJsonToS3 } from "../utils/do.js";
import { extractAndUpload } from "../utils/extractAndUpload.js";
import { v4 as uuidv4 } from "uuid";
import { deleteFileFromDO, deleteFileFromDOS3key, deleteFolderFromS3 } from "../utils/do.js";


const upload = asyncHandler(async (req, res) => {
    const { gameName, description, splashColor,
        isrotate, slug, points, gamePublishId, category } = req.body;


    if (!gameName || !description || !splashColor || !slug) {
        throw new ApiError(400, "Please Fill in all fields")
    }

    // ---- game zip handelling ---- 

    let gameUrl;

    let uploadedGameUrl = req.files["gameZip"] ? req.files["gameZip"][0].location : null;
    let gameZipKey = req.files["gameZip"][0].key



    if (uploadedGameUrl) {
        uploadedGameUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${gameZipKey}`
    }


    if (uploadedGameUrl) {
        const uploadUuid = req.uploadUuid || uuidv4().replace(/-/g, "").substring(0, 5);
        const originalFileName = req.files["gameZip"][0].originalname.toLowerCase() // Convert to lowercase
            .replace(/\s+/g, "-") // Replace spaces with "-"
            .replace(/\.zip$/i, ""); // Remove .zip extension if present;
        let extractedFiles = await extractAndUpload(gameZipKey, uploadUuid, originalFileName, "offlinegamesapp/games", true);
        const indexHtmlFileLink = extractedFiles.filter((file) => file.fileName === "index.html");
        gameUrl = indexHtmlFileLink[0].url
    }


    // ---- game zip handelling ---- 



    // ------ image handelling------

    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;

    if (uploadedImageUrl) {
        uploadedImageUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["image"][0].key}`;
    }


    // ------ image handelling------


    // create gameData.json file and upload it

    let uuid = req.uploadUuid
    let gameId = uuid ? parseInt(uuid, 10) : null;
    let gameDataUrl;

    const gameJson = {
        _id: gameId,
        gameName,
        description: description?.split(" ").slice(0, 10).join(" "),
        category: category[0],
        splashColor,
        imageUrl: uploadedImageUrl,
        gameUrl,
        slug,
        isrotate: isrotate === "true"
    }

    gameDataUrl = await uploadJsonToS3(uuid, gameJson, "offlinegamesapp/games")




    const games = await offlinegamesappGame.create({
        gameName,
        description,
        category,
        splashColor,
        imageUrl: uploadedImageUrl,
        gameUrl,
        isrotate,
        gameZipUrl: gameZipKey,
        slug,
        gameDataUrl,
        points,
        gamePublishId: gamePublishId ? gamePublishId : null
    })

    return res.status(201).json(new ApiResponse(201, games, "Game Uploaded Successfully"));

})

const getall = asyncHandler(async (req, res) => {
    const { page = 1, limit = 40, query, sortBy, category } = req.query;

    const pipeline = [];

    pipeline.push({
        $match: {}
    })

    if (sortBy === "newest") {
        pipeline.push({
            $sort: { createdAt: -1 }
        })
    }
    if (sortBy === "oldest") {
        pipeline.push({
            $sort: { createdAt: 1 }
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

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const game = await offlinegamesappGame.aggregatePaginate(offlinegamesappGame.aggregate(pipeline), options);


    return res.status(200).json(new ApiResponse(200, game, "All Games Fetched Successfully"));



})

const deleteGame = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await offlinegamesappGame.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    await offlinegamesappGame.findByIdAndDelete(gameId);

    // delete game folder 
    await deleteFolderFromS3(game?.gameUrl, "offlinegamesapp/");

    // delete game image
    await deleteFileFromDO(game?.imageUrl);


    // delete game Zip
    await deleteFileFromDOS3key(game?.gameZipUrl);

    // delete game Data json file

    await deleteFileFromDO(game?.gameDataUrl);

    return res.status(200).json(new ApiResponse(200, game, "Game Deleted Successfully"));
})

const getById = asyncHandler(async (req, res) => {
    const { gameId } = req.params;


    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await offlinegamesappGame.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    return res.status(200).json(new ApiResponse(200, game, "Game Fetched Successfully"));

})


const update = asyncHandler(async (req, res) => {

    const { gameId } = req.params;

    const { gameName, description, splashColor,
        isrotate, slug, points, gamePublishId, category } = req.body;


    if (!gameName || !description || !splashColor
        || !slug || !category) {
        throw new ApiError(400, "Please Fill in all fields")
    }

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid gameId");
    }

    const game = req.game;


    // ----- game zip handelling ----- 

    let extractedFiles = [];
    let gameUrl;
    let uploadedGameUrl = req.files["gameZip"] ? req.files["gameZip"][0].location : null;
    let gameZipKey;

    if (uploadedGameUrl) {
        gameZipKey = req.files["gameZip"][0].key
        uploadedGameUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${gameZipKey}`
        const uploadUuid = req.uploadUuid || uuidv4().replace(/-/g, "").substring(0, 8);
        const originalFileName = req.files["gameZip"][0].originalname.toLowerCase() // Convert to lowercase
            .replace(/\s+/g, "-") // Replace spaces with "-"
            .replace(/\.zip$/i, ""); // Remove .zip extension if present;
        extractedFiles = await extractAndUpload(gameZipKey, uploadUuid, originalFileName, "offlinegamesapp/games", true);
        const indexHtmlFileLink = extractedFiles.filter((file) => file.fileName === "index.html");
        gameUrl = indexHtmlFileLink[0].url;


        //  delete game
        await deleteFolderFromS3(game?.gameUrl, "offlinegamesapp/");


        // delete game zip
        await deleteFileFromDO(game?.gameZipUrl);

    }

    // ----- game zip handelling ----- 



    // ----- image handelling --------
    let imageUrl;
    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;

    if (uploadedImageUrl) {
        imageUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.files["image"][0].key}`;
        // delete previous image
        await deleteFileFromDO(game?.imageUrl);
    }


    // ----- image handelling --------


    // ------ gameDataJson Handelling ------- 

    let gameDataUrl;
    let gameDataJsonUpdated;


    if (uploadedGameUrl || uploadedImageUrl || game?.category[0] !== category[0] || game?.gameName !== gameName
        || game?.description !== description || game?.splashColor !== splashColor || game?.isrotate !== isrotate
        || game?.slug !== slug
    ) {
        // delete previous gameData.json file 

        await deleteFileFromDO(game?.gameDataUrl);


        // upload new file 
        let uuid = req.existingUniqueId
        let gameId = uuid ? parseInt(uuid, 10) : null;

        const gameJson = {
            _id: gameId,
            gameName,
            description: description?.split(" ").slice(0, 10).join(" "),
            category: category[0],
            splashColor,
            imageUrl: uploadedImageUrl ? uploadedImageUrl : game?.imageUrl,
            gameUrl: uploadedGameUrl ? gameUrl : game?.gameUrl,
            slug,
            isrotate: isrotate === "true"
        }

        gameDataUrl = await uploadJsonToS3(uuid, gameJson, "offlinegamesapp/games")
        gameDataJsonUpdated = true;

    }



    // ------ gameDataJson Handelling ------- 

    if (uploadedGameUrl) {
        game.gameUrl = gameUrl;
        game.gameZipUrl = gameZipKey;
    }

    if (uploadedImageUrl) {
        game.imageUrl = imageUrl
    }

    if (gameDataJsonUpdated) {
        game.gameDataUrl = gameDataUrl;
    }


    game.gameName = gameName;
    game.description = description;
    game.splashColor = splashColor;
    game.isrotate = isrotate;
    game.slug = slug;
    game.points = points
    game.gamePublishId = gamePublishId ? gamePublishId : null
    game.category = category;

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Game Updated Successfully"));
})

const getGameCategories = asyncHandler(async (req, res) => {
    const categories = await offlinegamesappGame.aggregate([
        { $unwind: "$category" },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])

    return res.status(200).json(new ApiResponse(200, categories, "Categories Fetched Succesfully"))
})


// ------- Notification Apis for offline games app ------- //

const sendNotificationToAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl } = req.body;

    if (!title || !body) {
        throw new ApiError(400, "Please Fill in All Fields")
    }

    const messageId = Date.now().toString();

    const message = {
        notification: {
            title,
            body,
            ...(imageUrl && { image: imageUrl })
        },
        data: {
            subscription: "normal",
            title,
            body,
            messageId: messageId,
            ...(imageUrl && { image: imageUrl })
        },
        topic: "all"
    };

    try {
        const response = await admin.messaging(admin.app("offlinegames")).send(message);
        return res.status(200).json({
            message: "Notification send successfully",
            response
        });
    } catch (error) {
        console.log("Error sending topic message:", error);
        return res.status(500).json({
            message: "Failed to send notification",
            error: error.message
        })
    }

})


const sendAdvertisementtoAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl, link } = req.body;

    if (!title || !body || !link) {
        throw new ApiError(400, "Please Fill in all fields")
    }

    const messageId = Date.now().toString();

    const message = {
        data: {
            subscription: "ads",
            data: link,
            title,
            body,
            urlLink: link,
            messageId,
            ...(imageUrl && { image: imageUrl })
        },
        topic: "all"
    }

    try {
        const response = await admin.messaging(admin.app("offlinegames")).send(message);
        console.log("Advertisement Notification sent to topic all:", response);
        return res.status(200).json({
            message: "Notification sent successfully",
            response
        })
    } catch (error) {
        console.error("Error sending topic message:", error);
        return res.status(500).json({
            message: "Failed to send notification",
            error: error.message
        })

    }

})


const sendGameNotificationtoAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl, mediaData } = req.body;

    if (!title || !body || !imageUrl || !mediaData) {
        throw new ApiError(400, "Please fill in all fields")
    }

    const messageId = Date.now().toString();

    const mediaPayload = {
        _id: mediaData?._id,
        gameName: mediaData?.gameName,
        description: mediaData?.description,
        splashColor: mediaData?.splashColor,
        imageUrl: mediaData?.imageUrl,
        gameUrl: mediaData?.gameUrl,
        slug: mediaData?.slug,
        isrotate: mediaData?.isrotate,
        gameDataUrl: mediaData?.gameDataUrl,
        gameZipUrl: mediaData?.gameZipUrl,
        points: mediaData?.points,
        gamePublishId: mediaData?.gamePublishId,
        createdAt: mediaData?.createdAt,
        updatedAt: mediaData?.updatedAt,
    }

    const message = {
        data: {
            subscription: 'play',
            screen: "GamePlayActivity",
            title,
            body,
            image: imageUrl,
            mediaData: JSON.stringify(mediaPayload),
            messageId
        },
        topic: "all"
    }


    try {
        const response = await admin.messaging(admin.app("offlinegames")).send(message);
        return res.status(200).json({
            message: "Notification sent successfully",
            response
        })
    } catch (error) {
        console.error("Error sending topic message:", error);
        return res.status(500).json({
            message: "Failed to send notification",
            error: error.message
        })
    }


})


const sendFavouriteGamesScreenNotificationToAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl } = req.body;

    if (!title || !body) {
        throw new ApiError(400, "Please Fill in All Fields")
    }

    const messageId = Date.now().toString();

    const message = {
        data: {
            subscription: "favourites",
            title,
            body,
            messageId: messageId,
            ...(imageUrl && { image: imageUrl })
        },
        topic: "all",
        android: {
            priority: "high"
        }
    };

    try {
        const response = await admin.messaging(admin.app("offlinegames")).send(message);
        return res.status(200).json({
            message: "Notification sent successfully",
            response
        })
    } catch (error) {
        console.log("Error sending topic message:", error);
        return res.status(500).json({
            message: "Failed to send notification",
            error: error.message
        })
    }
})


// ------- Notification Apis for offline games app ------- //


const uploadzip = asyncHandler(async (req, res) => {

    let zipUrl = req.file ? req.file.location : null;


    return res.status(200).json(new ApiResponse(200, zipUrl, "Zip Uploaded Successfully"));
})


const getfileSignedUrl = asyncHandler(async (req, res) => {



    const signedUrl = await generateSignedUrl("gamezips/98607/1741180374186-stories.png");


    return res.status(200).json(new ApiResponse(200, signedUrl, "SignedUrl get successfully"));

})


const getGameZipSignedUrl = asyncHandler(async (req, res) => {
    const { gameId } = req.query;

    if (!gameId) {
        throw new ApiError(400, "game Id is Required")
    }

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id")
    }

    const game = await offlinegamesappGame.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    const signedUrl = await generateSignedUrl(game?.gameZipUrl);

    return res.status(200).json(new ApiResponse(200, { gameZipUrl: signedUrl }, "Game Zip Url Fetched Successfully"));

})




export {
    upload, getall, deleteGame, getById, update,
    sendNotificationToAllUsers, sendAdvertisementtoAllUsers, sendGameNotificationtoAllUsers,
    sendFavouriteGamesScreenNotificationToAllUsers, uploadzip, getfileSignedUrl, getGameCategories,
    getGameZipSignedUrl
}




