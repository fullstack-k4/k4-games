import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
import { Popup } from "../models/popup.model.js";
import { isValidObjectId } from "mongoose";
import { deleteFileFromDO } from "../utils/do.js"



const createPopUp=asyncHandler(async(req,res)=>{
    const {link}=req.body;

    if(!link){
        throw new ApiError(400,"Please Fill in all fileds");
    }

    let uploadedImageUrl=req.file ? req.file.location : null;

    let bool;

    let imageUrl=req.body.imageUrl || ""

    if(uploadedImageUrl){
        imageUrl=uploadedImageUrl
        bool=true;
    }

    const popup = await Popup.create({
        link,
        imageUrl,
        imageSource: bool ? "self" : "link"
    })

    if (!popup) {
        throw new ApiError(500, "Failed to create popup");
    }
    return res.status(201).json(new ApiResponse(201, popup, "PopUp Created Successfully"));

})

const getAllPopUp = asyncHandler(async (req, res) => {

       let popup = await Popup.find({})
            .sort({ createdAt: -1 })
            .select("-__v -updatedAt -imageSource -createdAt");
    if (!popup) {
        return res.status(404, "No PopupFound");
    }

    return res.status(200).json(new ApiResponse(200, popup, "All PopUp Fetched Successfully"));
})

const getPopUpById = asyncHandler(async (req, res) => {
    const { _id } = req.query;

    if (!isValidObjectId(_id)) {
        throw new ApiError(400, "Invalid Object Id");
    }

    const popup = await Popup.findById(_id).select("-__v -updatedAt -imageSource -createdAt");

    if (!popup) {
        throw new ApiError(404, "No Popup Found");
    }

    return res.status(200).json(new ApiResponse(200, popup, "Popup Fetched Successfully"));


})

const deletePopup = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Object Id");
    }

    const popup = await Popup.findById(id);

    if (!popup) {
        throw new ApiError(404, "Popup not found");
    }

    let imageUrl = popup.imageUrl;

    const deletedPopup = await Popup.findByIdAndDelete(id);


    if (!deletedPopup) {
        throw new ApiError(500, "Failed to delete popup");
    }

    if (imageUrl && popup.imageSource === "self") {
        imageUrl=imageUrl.replace(`${process.env.DIGITALOCEAN_ENDPOINT}/${process.env.DIGITALOCEAN_BUCKET_NAME}/`,"")
        await deleteFileFromDO(imageUrl);
    }

    return res.status(200).json(new ApiResponse(200, deletedPopup, "Popup deleted Successfully"));

})



export  {createPopUp,getAllPopUp,getPopUpById,deletePopup};

