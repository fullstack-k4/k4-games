import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const reportSchema=Schema({
    gameId:{
        type:String,
        required:[true,"gameId is required"]
    },
    gameName:{
        type:String,
        required:[true,"gameName is required"]
    },
    imageUrl:{
        type:String,
        required:[true,"imageUrl is required"]
    },
    gameUrl:{
        type:String,
        required:[true,"gameUrl is required"]
    },
    reportDescription:{
        type:String,
        trim:true
    },
    reportType:{
        type:String,
        enum:["Bug","Error","Other"],
    }

},{ timestamps: true })

reportSchema.plugin(mongooseAggregatePaginate);
export const Report=mongoose.model("Report",reportSchema);