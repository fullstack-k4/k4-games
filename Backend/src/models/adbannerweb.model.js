import mongoose, { Schema } from "mongoose";


const adbannerwebSchema = new Schema({
    imageUrl: {
        type: String,
        default: null,
    },
    link: {
        type: String,
        default: null,
    },
    position: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["image", "adsense"]
    },
    imageSource: {
        type: String,
        enum: ["self", "link"],
        default: null
    },
}, { timestamps: true })



export const Adbannerweb = mongoose.model("Adbannerweb", adbannerwebSchema);


