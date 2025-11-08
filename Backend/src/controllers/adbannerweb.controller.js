import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Adbannerweb } from "../models/adbannerweb.model.js";
import { isValidObjectId } from "mongoose";
import { deleteFileFromDO } from "../utils/do.js"



const create = asyncHandler(async (req, res) => {
    const { link, position, type } = req.body;


    if (!position || !type) {
        throw new ApiError(400, "Please Fill in all fields");
    }

    let imageUrl = req.body.imageUrl || null;

    let uploadedImageUrl = req.file ? req.file.location : null;


    if (uploadedImageUrl) {
        uploadedImageUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.file.key}`
        imageUrl = uploadedImageUrl;
    }


    const adbannerweb = await Adbannerweb.create({
        link,
        position,
        type,
        imageUrl,
        ...(type !== 'adsense' && {
            imageSource: uploadedImageUrl ? 'self' : 'link',
        }),
    });


    if (!adbannerweb) {
        throw new ApiError(500, "Failed to create popup");
    }

    return res.status(201).json(new ApiResponse(201, adbannerweb, "Ad Banner Web Created Successfully"));

})

const deleteById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id")
    }

    const adbannerweb = await Adbannerweb.findById(id);

    if (!adbannerweb) {
        throw new ApiError(400, "AdBanner Web not found");
    }

    let imageUrl = adbannerweb.imageUrl;

    const deletedadbannerweb = await Adbannerweb.findByIdAndDelete(id);

    if (!deletedadbannerweb) {
        throw new ApiError(400, "Failed to delete ad banner wev");
    }

    if (imageUrl && adbannerweb.imageSource === "self") {
        await deleteFileFromDO(imageUrl);
    }

    return res.status(200).json(new ApiResponse(200, deletedadbannerweb, "Adbanner Web deleted successfully"));
})

// For Dashboard
const getAll = asyncHandler(async (_, res) => {

    const adbannersweb = await Adbannerweb.find({}).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, adbannersweb, "All Ad Banners Web Fetched Successfully"));

})

// For Website
const getAllAdBannersWeb = asyncHandler(async (_, res) => {
    const adbannersweb = await Adbannerweb.aggregate([
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
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, adbannersweb, "Latest AdBanner Web per Position Fetched Successfully"));
});







export { create, deleteById, getAll, getAllAdBannersWeb };











