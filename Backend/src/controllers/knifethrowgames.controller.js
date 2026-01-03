import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { Knifethrowgame } from "../models/knifethrowgames.model.js";
import { isValidObjectId } from "mongoose";
import admin from "../config/knifethrowfirebaseConfig.js";


const uploadGame = asyncHandler(async (req, res) => {

    const { gameName, description, splashColor, imageUrl, gameUrl, slug, isrotate } = req.body;



    if (!gameName || !description || !splashColor || !imageUrl || !gameUrl || !slug) {
        throw new ApiError(400, "Please Fill in all fields");
    }


    const game = await Knifethrowgame.create({
        gameName,
        description,
        splashColor,
        imageUrl,
        gameUrl,
        slug,
        isrotate
    })


    return res.status(201).json(new ApiResponse(201, game, "Game Created Successfully"));
})


const deleteGame = asyncHandler(async (req, res) => {
    const { gameId } = req.params;


    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await Knifethrowgame.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    await Knifethrowgame.findByIdAndDelete(gameId);


    return res.status(200).json(new ApiResponse(200, game, "Game Deleted Succesfully"));

})


const getAllGame = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy } = req.query;

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

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const game = await Knifethrowgame.aggregatePaginate(Knifethrowgame.aggregate(pipeline), options);


    return res.status(200).json(new ApiResponse(200, game, "All Games Fetched Successfully"));
})

const getById = asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const game = await Knifethrowgame.findById(gameId);

    if (!game) {
        throw new ApiError(404, "Game Not Found");
    }

    return res.status(200).json(new ApiResponse(200, game, "Game Fetched Successfully"));
})

const update = asyncHandler(async (req, res) => {

    const { gameId } = req.params;

    const { gameName, description, slug,
        imageUrl, gameUrl, splashColor,
        isrotate } = req.body;

    if (!gameName || !description || !splashColor || !imageUrl || !slug || !gameUrl) {
        throw new ApiError(400, "Please Fill in all fields")
    }

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid game Id");
    }

    const game = await Knifethrowgame.findById(gameId);


    game.gameName = gameName;
    game.description = description;
    game.slug = slug;
    game.imageUrl = imageUrl;
    game.gameUrl = gameUrl;
    game.splashColor = splashColor;
    game.isrotate = isrotate


    await game.save();


    return res.status(200).json(new ApiResponse(200, game, "Game Updated Successfully"))
})


// --------- Notification Apis for knife throw app ---------

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
        const response = await admin.messaging(admin.app("knifethrow")).send(message);
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

const sendNewGamesNotificationToAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl } = req.body;

    if (!title || !body) {
        throw new ApiError(400, "Please Fill in All Fields")
    }

    const messageId = Date.now().toString();


    const message = {
        data: {
            subscription: "newest",
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
        const response = await admin.messaging(admin.app("knifethrow")).send(message);
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



const sendSavedGamesNotificationToAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl } = req.body;

    if (!title || !body) {
        throw new ApiError(400, "Please Fill in All Fields")
    }

    const messageId = Date.now().toString();


    const message = {
        data: {
            subscription: "saved",
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
        const response = await admin.messaging(admin.app("knifethrow")).send(message);
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
        const response = await admin.messaging(admin.app("knifethrow")).send(message);
        console.log("Advertisement Notification sent to topic all:", response);
        return res.status(200).json({
            message: "Notification sent successfully",
            response,
        })
    } catch (error) {
        console.error("Error sending topic messsage:", error);
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
        createdAt: mediaData?.createdAt,
        updatedAt: mediaData?.updatedAt,
        __v: mediaData?.__v
    }

    const message = {
        data: {
            subscription: "play",
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
        const response = await admin.messaging(admin.app("knifethrow")).send(message);
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


// --------- Notification Apis for knife throw app ---------




export {
    uploadGame, deleteGame, getAllGame, sendNotificationToAllUsers,
    sendAdvertisementtoAllUsers, sendGameNotificationtoAllUsers, sendNewGamesNotificationToAllUsers,
    sendSavedGamesNotificationToAllUsers, update, getById
}
