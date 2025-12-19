import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const knifethrowgameSchema = new Schema({
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
    splashColor: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    gameUrl: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    isrotate: {
        type: Boolean,
        required: true,
        default: false
    }

}, { timestamps: true })


knifethrowgameSchema.plugin(mongooseAggregatePaginate)



export const Knifethrowgame = mongoose.model("Knifethrowgame", knifethrowgameSchema)