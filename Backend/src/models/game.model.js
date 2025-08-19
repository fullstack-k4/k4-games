import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const gameSchema = new Schema({
    gameName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: [String],
        required: true,
    },
    primaryCategory: {
        type: String,
        required: true,
    },
    splashColor: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    gameUrl: {
        type: String,
        trim: true,
    },
    downloadable: {
        type: Boolean,
        default: false,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isRecommended: {
        type: Boolean,
        default: false,
    },
    isAppOnly: {
        type: Boolean
    },
    isHiddenWeb: {
        type: Boolean
    },
    isPremium: {
        type: Boolean
    },
    recommendedImageUrl: {
        type: String,
        default: null,
    },
    featuredImageUrl: {
        type: String,
        default: null,
    },
    featuredVideoUrl: {
        type: String,
        default: null,
    },
    backgroundVideoUrl: {
        type: String,
        default: null
    },
    isloading: {
        type: Boolean,
        default: false,
    },
    isrotate: {
        type: Boolean,
        required: true,
        default: false,
    },
    topTenCount: {
        type: Number,
        default: 0
    },
    gameZipUrl: {
        type: String,
    },
    gameSource: {
        type: String,
        enum: ["self", "link"],
    },
    thumbnailSource: {
        type: String,
        enum: ["self", "link"],
    },
    backgroundVideoSource: {
        type: String,
        enum: ["self", "link"],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    slug: {
        type: String,
        unique: true
    },
    instruction: {
        type: String,
        default: "",
    },
    gamePlayVideo: {
        type: String,
        default: ""
    },
    likesCount: {
        type: Number,
        default: 0
    },
    dislikesCount: {
        type: Number,
        default: 0
    },
    isDesktop: {
        type: Boolean
    },
    gameDataUrl: {
        type: String,
        default: "",
    }

}, { timestamps: true })

gameSchema.plugin(mongooseAggregatePaginate);


export const Game = mongoose.model("Game", gameSchema);