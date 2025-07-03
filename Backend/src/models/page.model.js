import mongoose, { Schema } from "mongoose"


const pageSchema = Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    slug: {
        type: String,
        required: [true, "Slug is required"],
        unique: true
    },
    content: {
        type: String,
        required: [true, "Content is required"]
    }
})


export const Page = mongoose.model("Page", pageSchema);