import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Game } from "../models/game.model.js";






const dashboardData=asyncHandler(async(__,res)=>{
    const totalGames=await Game.countDocuments();
    const totalAllowedDownloads=await Game.countDocuments({downloadable:true})
    const totalNumberOfSelfUploadedGames=await Game.countDocuments({gameSource:"self"})
    const totalNumberofUploadedGamesByLink=await Game.countDocuments({gameSource:"link"})


    const data={
        totalGames,
        totalAllowedDownloads,
        totalNumberOfSelfUploadedGames,
        totalNumberofUploadedGamesByLink
    }
    return res.status(200).json(new ApiResponse(200,data,"Dashboard Data Fetched Successfully"));

})


export {dashboardData};