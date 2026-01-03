import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const offlinegamesappgameSchema = new Schema({
    gameName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: [String],
        required: true
    },
    splashColor: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true,
    },
    gameUrl: {
        type: String,
        required: true,
        trim: true
    },
    isrotate: {
        type: Boolean,
        required: true,
        default: false,
    },
    gameZipUrl: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true
    },
    gameDataUrl: {
        type: String,
        required: true
    },
    points: {
        type: String,
        required: true
    },
    gamePublishId: {
        type: String,
        default: null
    },
}, { timestamps: true })

offlinegamesappgameSchema.plugin(mongooseAggregatePaginate);



export const offlinegamesappGame = mongoose.model("offlinegamesappGame", offlinegamesappgameSchema);