import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { Vote } from "../models/vote.model.js";
import { Game } from "../models/game.model.js";


const VoteGame = asyncHandler(async (req, res) => {
    const { gameId, type } = req.query;

    let ip = req.ip;
    if (ip.startsWith("::ffff:")) ip = ip.slice(7);
    if (ip === "::1") ip = "127.0.0.1";

    if (!isValidObjectId(gameId)) {
        throw new ApiError(400, "Invalid game id");
    }

    const existing = await Vote.findOne({ gameId, ip });

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
            await Vote.deleteOne({ gameId, ip });

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

    const vote = await Vote.create({ gameId, ip, type });
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


export { VoteGame };