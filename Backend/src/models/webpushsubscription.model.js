import mongoose, { Schema } from "mongoose";


const webpushsubscriptionSchema = new Schema({
    endpoint: {
        type: String,
    },
    keys: {
        type: Object
    }
}, { timestamps: true })



export const Webpushsubscription = mongoose.model("Webpushsubscription", webpushsubscriptionSchema)