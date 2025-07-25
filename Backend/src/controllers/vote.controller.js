import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { Vote } from "../models/vote.model.js";
import { Game } from "../models/game.model.js";


const VoteGame = asyncHandler(async (req, res) => {
    const { gameId, type, visitorId } = req.query;


    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid game id");
    }

    const existing = await Vote.findOne({ gameId, visitorId });

    async function safelyDecrement(gameId, field) {
        const game = await Game.findById(gameId);
        const current = game?.[field] || 0;
        const newValue = Math.max(current - 1, 0);
        await Game.findByIdAndUpdate(gameId, {
            $set: { [field]: newValue },
        });
    }

    if (existing) {
        if (existing.type === type) {
            await Vote.deleteOne({ gameId, visitorId });

            const field = type === "like" ? "likesCount" : "dislikesCount";
            await safelyDecrement(gameId, field);

            return res.status(200).json(
                new ApiResponse(
                    200,
                    existing,
                    `${type === "like" ? "Unliked" : "Undisliked"} Successfully`
                )
            );
        } else {
            const oldField = existing.type === "like" ? "likesCount" : "dislikesCount";
            const newField = type === "like" ? "likesCount" : "dislikesCount";

            await safelyDecrement(gameId, oldField);

            existing.type = type;
            await existing.save();

            await Game.findByIdAndUpdate(gameId, {
                $inc: { [newField]: 1 },
            });

            return res
                .status(200)
                .json(new ApiResponse(200, existing, `Changed to ${type}`));
        }
    }

    const vote = await Vote.create({ gameId, visitorId, type });
    const field = type === "like" ? "likesCount" : "dislikesCount";
    await Game.findByIdAndUpdate(gameId, {
        $inc: { [field]: 1 },
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                vote,
                `${type === "like" ? "Liked" : "Disliked"} Successfully`
            )
        );
});


const checkVoteStatus = asyncHandler(async (req, res) => {
    const { gameId, visitorId } = req.query;

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid Object Id");
    }

    // Find these visitor has liked or not

    const vote = await Vote.findOne({ gameId, visitorId });

    const isLiked = vote?.type === 'like';
    const isDisliked = vote?.type === 'dislike';


    return res.status(200).json(new ApiResponse(200, { isLiked, isDisliked }, "Vote Status Fetched Successfully"));
})


const getLikedGames = asyncHandler(async (req, res) => {
    const { visitorId, page = 1, limit = 10 } = req.query;

    if (!visitorId) {
        throw new ApiError(400, "Visitor ID is required");
    }

    const pipeline = [
        {
            $match: {
                visitorId,
                type: "like"
            }
        },
        {
            $lookup: {
                from: 'games',
                localField: 'gameId',
                foreignField: '_id',
                as: 'game'
            }
        },
        {
            $unwind: '$game'
        },
        {
            $replaceRoot: { newRoot: '$game' }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ];

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const likedgames = await Vote.aggregatePaginate(Vote.aggregate(pipeline), options);

    return res.status(200).json(
        new ApiResponse(200, likedgames, "Liked Games Fetched Successfully")
    );
});




export { VoteGame, checkVoteStatus, getLikedGames };