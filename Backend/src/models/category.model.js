import mongoose,{Schema} from "mongoose";



const categorySchema=Schema({
    name:{
        type:String,
        required:[true,"Category is required"],
        unique:[true,"Category already exists"],
        trim:true
    },
    imageUrl:{
        type:String,
    },
    imageSource:{
        type:String,
        enum:["self","link"],
        default:"link"
    }
})

export const Category=mongoose.model("Category",categorySchema);