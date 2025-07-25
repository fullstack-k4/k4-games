import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const voteSchema = new Schema({
    gameId: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
    },
    visitorId: {
        type: String
    },
    type: {
        type: String,
        enum: ['like', 'dislike']
    }
}, { timestamps: true })


voteSchema.plugin(mongooseAggregatePaginate);
voteSchema.index({ gameId: 1, type: 1 });
export const Vote = mongoose.model("Vote", voteSchema)

