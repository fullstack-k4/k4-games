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
        default: "link"
    },
    iconSource: {
        type: String,
        enum: ["self", "link"],
        default: "link"
    },
    slug: {
        type: String,
        unique: true,
    },
    isSidebar: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


categorySchema.plugin(mongooseAggregatePaginate)

export const Category = mongoose.model("Category", categorySchema);