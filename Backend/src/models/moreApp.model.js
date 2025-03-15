import mongoose,{Schema} from "mongoose";


const moreAppSchema=new Schema({
    imageUrl:{
        type:String,
    },
    link:{
        type:String,
        required:true,
    },
    imageSource:{
        type:String,
        enum:["self","link"],
        default:"link"
    }


},{timestamps:true})


export const MoreApp=mongoose.model("MoreApp",moreAppSchema);