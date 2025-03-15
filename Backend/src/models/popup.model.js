import mongoose, { Schema } from "mongoose";

const popupSchema = new Schema({
    imageUrl: {
        type: String,
    },
    link: {
        type: String,
        required: true
    },
    imageSource:{
        type:String,
        enum:["self","link"],
        default:"link"
    }
}, { timestamps: true })

export const Popup = mongoose.model("Popup", popupSchema);


