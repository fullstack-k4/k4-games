import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const categorySchema = Schema({
    name: {
        type: String,
        required: [true, "Category is required"],
        unique: [true, "Category already exists"],
        trim: true
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    iconUrl: {
        type: String
    },
    imageSource: {
        type: String,
        enum: ["self", "link"],
    },
    iconSource: {
        type: String,
        enum: ["self", "link"],
    },
    slug: {
        type: String,
        unique: true,
    },
    isSidebar: {
        type: Boolean,
        default: false
    },
    gradientColor1: {
        type: String,
    },
    gradientColor2: {
        type: String
    },
    order: {
        type: Number,
        required: [true, "Order is required"]
    }
}, { timestamps: true })


categorySchema.plugin(mongooseAggregatePaginate)

export const Category = mongoose.model("Category", categorySchema);