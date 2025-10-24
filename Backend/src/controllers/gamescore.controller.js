import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GameScore } from "../models/gamescore.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Game } from "../models/game.model.js";


const updateScore = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const { gameId, score } = req.body;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    if (!gameId || !score) {
        throw new ApiError(400, "gameId and score are required");
    }

    const gameExists = await Game.exists({ _id: gameId });

    if (!gameExists) {
        throw new ApiError(404, "Game Not Found");
    }

    const updatedScore = await GameScore.findOneAndUpdate(
        { user: userId, game: gameId },
        {
            $set: {
                lastScore: score,
                lastPlayedAt: new Date(),
            },
            $max: { bestScore: score }
        }, {
        upsert: true,
        new: true,
    }
    );

    return res.status(200).json(new ApiResponse(200, updatedScore, "Score Updated Successfully"));
})


const getUserRank = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const { gameId } = req.query;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id");
    }

    const gameExists = await Game.exists({ _id: gameId });

    if (!gameExists) {
        throw new ApiError(404, "Game Not Found");
    }

    const userScore = await GameScore.findOne({ user: userId, game: gameId });


    if (!userScore) {
        return res.status(200).json(new ApiResponse(200, {
            userRank: 0,
            bestScore: 0
        }, "User has no score yet"))
    }

    // Count how many have better score
    const higherScoresCount = await GameScore.countDocuments({
        game: gameId,
        bestScore: { $gt: userScore?.bestScore }
    })

    const rank = higherScoresCount + 1;


    return res.status(200).json(new ApiResponse(200, {
        userRank: rank,
        bestScore: userScore?.bestScore
    }, "User rank Fetched successfully"))
})


const getLeaderBoard = asyncHandler(async (req, res) => {
    const { gameId, page = 1, limit = 10 } = req.query;


    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Game Id")
    }

    const gameExists = await Game.exists({ _id: gameId });

    if (!gameExists) {
        throw new ApiError(404, "Game Not Found");
    }

    const pipeline = [
        {
            $match: {
                game: {
                    $eq: new mongoose.Types.ObjectId(gameId)
                }
            }
        }, {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            email: 1,
                        }
                    }
                ]

            }
        }, {
            $unwind: "$user"
        }, {
            $sort: { bestScore: -1, updatedAt: 1 }
        }, {
            $project: {
                _id: 0,
                userId: "$user._id",
                username: "$user.username",
                avatar: "$user.avatar",
                bestScore: 1,
                lastPlayedAt: 1
            }
        }
    ]

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const leaderboard = await GameScore.aggregatePaginate(GameScore.aggregate(pipeline), options);



    return res.status(200).json(new ApiResponse(200, leaderboard, "Leaderboard Fetched Successfully"))
})



export { updateScore, getUserRank, getLeaderBoard }











