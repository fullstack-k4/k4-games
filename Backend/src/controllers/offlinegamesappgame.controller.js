import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { offlinegamesappGame } from "../models/offlinegamesappgame.model.js"
import { isValidObjectId } from "mongoose";


const upload = asyncHandler(async (req, res) => {
    const { gameName, description, splashColor,
        imageUrl, gameUrl, isrotate,
        gameZipUrl, slug, gameDataUrl,
        points } = req.body;

    if (!gameName || !description || !splashColor
        || !imageUrl || !gameUrl || !gameZipUrl
        || !slug || !gameDataUrl) {
        throw new ApiError(400, "Please Fill in all fields")
    }


    const games = await offlinegamesappGame.create({
        gameName,
        description,
        splashColor,
        imageUrl,
        gameUrl,
        isrotate,
        gameZipUrl,
        slug,
        gameDataUrl,
        points
    })

    return res.status(201).json(new ApiResponse(201, games, "Game Uploaded Successfully"));

})

const getall = asyncHandler(async (req, res) => {
    const { page = 1, limit = 40, query, sortBy } = req.query;

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
        imageUrl, gameUrl, isrotate,
        gameZipUrl, slug, gameDataUrl,
        points } = req.body;


    if (!gameName || !description || !splashColor
        || !imageUrl || !gameUrl || !gameZipUrl
        || !slug || !gameDataUrl) {
        throw new ApiError(400, "Please Fill in all fields")
    }

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid gameId");
    }

    const game = await offlinegamesappGame.findById(gameId);


    game.gameName = gameName;
    game.description = description;
    game.splashColor = splashColor;
    game.imageUrl = imageUrl;
    game.gameUrl = gameUrl;
    game.isrotate = isrotate;
    game.gameZipUrl = gameZipUrl;
    game.slug = slug;
    game.gameDataUrl = gameDataUrl;
    game.points = points

    await game.save();

    return res.status(200).json(new ApiResponse(200, game, "Game Updated Successfully"));
})


export { upload, getall, deleteGame, getById, update }




