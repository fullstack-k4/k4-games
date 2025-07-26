import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Adbanner } from "../models/adbanner.model.js";
import { deleteFileFromDOS3key } from "../utils/do.js";
import { isValidObjectId } from "mongoose";


const create = asyncHandler(async (req, res) => {
    const { link, position, type, adsenseId } = req.body;


    if (!position || !type) {
        throw new ApiError(400, "Please Fill in all fields");
    }

    let uploadedImageUrl = req.file ? req.file.location : null;

    let imageUrl = req.body.imageUrl || null;

    if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
    }


    const adbanner = await Adbanner.create({
        link,
        position,
        type,
        imageUrl,
        adsenseId,
        ...(type !== 'adsense' && {
            imageSource: uploadedImageUrl ? 'self' : 'link',
        }),
    });



    if (!adbanner) {
        throw new ApiError(500, "Failed to create popup");
    }

    return res.status(201).json(new ApiResponse(201, adbanner, "Ad Banner Created Successfully"));

})

const deleteById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id")
    }

    const adbanner = await Adbanner.findById(id);

    if (!adbanner) {
        throw new ApiError(400, "AdBanner not found");
    }

    let imageUrl = adbanner.imageUrl;

    const deletedadbanner = await Adbanner.findByIdAndDelete(id);

    if (!deletedadbanner) {
        throw new ApiError(400, "Failed to delete ad banner");
    }

    if (imageUrl && adbanner.imageSource === "self") {
        imageUrl = imageUrl.replace(`${process.env.DIGITALOCEAN_ENDPOINT}/${process.env.DIGITALOCEAN_BUCKET_NAME}/`, "")
        await deleteFileFromDOS3key(imageUrl);
    }

    return res.status(200).json(new ApiResponse(200, deletedadbanner, "Adbanner deleted successfully"));
})

// For Dashboard
const getAll = asyncHandler(async (_, res) => {

    const adbanners = await Adbanner.find({}).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, adbanners, "All Ad Banners Fetched Successfully"));

})

// For App
const getAllAdBanners = asyncHandler(async (_, res) => {
    const adbanners = await Adbanner.aggregate([
        { $sort: { createdAt: -1 } },

        {
            $group: {
                _id: "$position",
                doc: { $first: "$$ROOT" }
            }
        },

        {
            $project: {
                _id: "$doc._id",
                imageUrl: {
                    $cond: [{ $eq: ["$doc.type", "image"] }, "$doc.imageUrl", "$$REMOVE"]
                },
                link: {
                    $cond: [{ $eq: ["$doc.type", "image"] }, "$doc.link", "$$REMOVE"]
                },
                position: "$doc.position",
                type: "$doc.type",
                adsenseId: {
                    $cond: [{ $eq: ["$doc.type", "adsense"] }, "$doc.adsenseId", "$$REMOVE"]
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, adbanners, "Latest AdBanner per Position Fetched Successfully"));
});







export { create, deleteById, getAll, getAllAdBanners };











