import mongoose, { Schema } from "mongoose";


const adbannerSchema = new Schema({
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
    adsenseId: {
        type: String,
        default: null
    }
}, { timestamps: true })



export const Adbanner = mongoose.model("Adbanner", adbannerSchema);


