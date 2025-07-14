import mongoose, { Schema } from "mongoose"


const voteSchema = new Schema({
    gameId: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
    },
    ip: {
        type: String
    },
    type: {
        type: String,
        enum: ['like', 'dislike']
    }
})


export const Vote = mongoose.model("Vote", voteSchema)

voteSchema.index({ gameId: 1, type: 1 });
