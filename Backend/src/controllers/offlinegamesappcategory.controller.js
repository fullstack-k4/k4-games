import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Offlinegamescategory } from "../models/offlinegamesappcategory.model.js"
import { deleteFileFromDO } from "../utils/do.js"




const createCategory = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;

    if (!name || !slug) {
        throw new ApiError(400, "Please Fill in all fields");
    }

    let uploadedImageUrl = req.file.location ? req.file.location : null;
    let imageUrl;

    if (uploadedImageUrl) {
        uploadedImageUrl = `${process.env.DIGITALOCEAN_BUCKET_STARTER_URL}/${req.file.key}`
        imageUrl = uploadedImageUrl
    }

    const category = Offlinegamescategory.create({ name, slug, imageUrl });

    return res.status(201).json(new ApiResponse(201, category, "Category Created Successfully"));
})


const getAllCategory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query } = req.query;

    const pipeline = [];

    pipeline.push({
        $match: {}
    })


    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    {
                        name: { $regex: query, $options: "i" }
                    }
                ]
            }
        })
    }


    pipeline.push({ $sort: { createdAt: -1, } })

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const categories = await Offlinegamescategory.aggregatePaginate(Offlinegamescategory.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, categories, "All Categories Fetched Successfully"));
})

const getAllCategoriesList = asyncHandler(async(req,res)=>{
    const categories = await Offlinegamescategory.find({});
    return res.status(200).json(new ApiResponse(200,categories,"Categories Fetched Successfully"));
})




const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id")
    }

    const category = await Offlinegamescategory.findById(id);

    if (!category) {
        throw new ApiError(404, "No Category Found");
    }

    let imageUrl = category.imageUrl;

    await Offlinegamescategory.findByIdAndDelete(id);

    if (imageUrl) {
        await deleteFileFromDO(imageUrl);
    }

    return res.status(200).json(new ApiResponse(200, category, "Category Deleted Successfully"));

})



export { createCategory, getAllCategory, deleteCategory,getAllCategoriesList }