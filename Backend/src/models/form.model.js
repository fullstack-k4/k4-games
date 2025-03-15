import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const formSchema=Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"name is required"]
    },
    email:{
        type:String,
        trim:true,
        required:[true,"email is required"]
    },
    phoneNumber:{
        type:Number,
        trim:true,
        required:[true,"phone number is required"]
    },
    description:{
        type:String,
        trim:true,
        required:[true,"description is required"]
    },
    attachmentUrl:{
        type:String,
    }
},{timestamps:true})


formSchema.plugin(mongooseAggregatePaginate);



export const Form=mongoose.model("Form",formSchema);