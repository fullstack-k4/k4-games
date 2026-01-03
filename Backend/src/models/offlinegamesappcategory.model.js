import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const offlinegamescategorySchema = Schema({
    name: {
        type: String,
        required: [true, "Category is required"],
        unique: [true, "Category already exists"],
        trim: true
    },
    imageUrl: {
        type: String,
    },
    slug: {
        type: String,
        unique: true
    }
}, { timestamps: true })


offlinegamescategorySchema.plugin(mongooseAggregatePaginate)


export const Offlinegamescategory = mongoose.model("Offlinegamescategory", offlinegamescategorySchema);






