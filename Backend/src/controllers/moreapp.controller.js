import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
import { MoreApp } from "../models/moreApp.model.js";
import { isValidObjectId } from "mongoose";
import { deleteFileFromDO } from "../utils/do.js"




const createApp = asyncHandler(async (req, res) => {
    const { link } = req.body;
    if (!link) {
        throw new ApiError(400, "link is required");
    }

    let uploadedImageUrl = req.file ? req.file.location : null;

    let bool;


    let imageUrl = req.body.imageUrl || ""

    if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl
        bool = true;
    }

    const app = await MoreApp.create({
        link,
        imageUrl,
        imageSource: bool ? "self" : "link"
    })

    if (!app) {
        throw new ApiError(500, "Failed to create app");
    }
    return res.status(200).json(new ApiResponse(201, app, " App Created Successfully"));
})

const getAllApp = asyncHandler(async (req, res) => {

    const app = await MoreApp.find({})
        .sort({ createdAt: -1 })
        .select("-__v -updatedAt -imageSource -createdAt");

    if (!app) {
        return res.status(404, "No App Found");
    }

    return res.status(200).json(new ApiResponse(200, app, "All App Fetched Successfully"));
})


const deleteApp = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Object Id");
    }

    const app = await MoreApp.findById(id);

    if (!app) {
        throw new ApiError(404, "App not found");
    }

    let imageUrl = app.imageUrl;

    const deletedApp = await MoreApp.findByIdAndDelete(id);


    if (!deletedApp) {
        throw new ApiError(500, "Failed to delete App");
    }

    if (imageUrl && app.imageSource === "self") {
        imageUrl = imageUrl.replace(`${process.env.DIGITALOCEAN_ENDPOINT}/${process.env.DIGITALOCEAN_BUCKET_NAME}/`, "")  ;
        await deleteFileFromDO(imageUrl);
    }

    return res.status(200).json(new ApiResponse(200, deleteApp, "App deleted Successfully"));

})



export { createApp, deleteApp, getAllApp };




