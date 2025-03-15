import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Game } from "../models/game.model.js";
import {Popup} from "../models/popup.model.js";
import {Form} from "../models/form.model.js"
import {Report} from "../models/report.model.js"
import {MoreApp} from "../models/moreApp.model.js"






const dashboardData=asyncHandler(async(__,res)=>{
    const totalGames=await Game.countDocuments();
    const totalAllowedDownloads=await Game.countDocuments({downloadable:true})
    const totalNumberOfSelfUploadedGames=await Game.countDocuments({gameSource:"self"})
    const totalNumberofUploadedGamesByLink=await Game.countDocuments({gameSource:"link"})
    const totalNumberofPopups=await Popup.countDocuments({});
    const totalNumberofForms=await Form.countDocuments({});
    const totalNumberofReports=await Report.countDocuments({});
    const totalNumberofMoreApps=await MoreApp.countDocuments({});



    const data={
        totalGames,
        totalAllowedDownloads,
        totalNumberOfSelfUploadedGames,
        totalNumberofUploadedGamesByLink,
        totalNumberofPopups,
        totalNumberofForms,
        totalNumberofReports,
        totalNumberofMoreApps
    }
    return res.status(200).json(new ApiResponse(200,data,"Dashboard Data Fetched Successfully"));

})


export {dashboardData};