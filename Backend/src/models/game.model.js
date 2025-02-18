import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// If you add More Categories in Future Add Here and also add in Frontend also in Add Game Page
const validCategories = [
    "Puzzle", "Word", "Multiplayer", "Arcade", "Recommended",
    "Brain", "Sports", "Shooting", "Animal", "Action",
    "Ball", "All-Games"
];

const gameSchema = new Schema({
    gameName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: [String],
        enum:validCategories,
        required: true,

    },
    splashColor: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
    },
    gameUrl: {
        type: String,
    },
    isdownload: {
        type: Boolean,
    },
    isloading: {
        type: Boolean,
        default:false,
    },
    isrotate: {
        type: Boolean,
        required: true,
        default:false,
    },
    topTenCount: {
        type: Number,
        default: 0
    },
    gameFolder: {
        type: String,
    },
    source:{
        type:String,
        enum:["self","link"]
    }

}, { timestamps: true })

gameSchema.plugin(mongooseAggregatePaginate);


export const Game = mongoose.model("Game", gameSchema);