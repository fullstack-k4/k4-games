import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const GameScoreSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: true,
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: "Game",
        index: true,
        required: true,
    },
    bestScore: {
        type: Number,
        required: true,
        default: 0,
        index: true,
    },
    lastScore: {
        type: Number,
        default: 0
    },
    lastPlayedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });


GameScoreSchema.plugin(mongooseAggregatePaginate)

export const GameScore = mongoose.model("GameScore", GameScoreSchema);