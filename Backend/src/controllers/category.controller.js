import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose"
import { Category } from "../models/category.model.js"
import { deleteFileFromDO } from "../utils/do.js"


const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, isSidebar, description } = req.body;

    // validating slug
    const slugFound = await Category.findOne({ slug });

    if (slugFound) {
        throw new ApiError(400, "Slug Already Exists");
    }
    let imageUrl = req.body.imageUrl || "";
    let iconUrl = req.body.iconUrl || "";
    let imageSource;
    let iconSource;

    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;
    let iconImageUrl = req.files["icon"] ? req.files["icon"][0].location : null;



    if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
        imageSource = "self"
    }

    if (iconImageUrl) {
        iconUrl = iconImageUrl
        iconSource = "self"
    }

    if (!name) {
        throw new ApiError(400, "Please fill in all fields");
    }
    const category = await Category.create({ name, imageUrl, imageSource, slug, iconUrl, iconSource, isSidebar, description });
    return res.status(201).json(new ApiResponse(201, category, "Category Created Successfully"));

})

const getAllCategory = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).select("-__v -imageSource -iconSource");
    return res.status(200).json(new ApiResponse(200, categories, "All Categories Fetched Successfully"));
})


// For Sidebar in website
const getAllCategoryWeb = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isSidebar: true }).select("-__v -imageSource -iconSource");
    return res.status(200).json(new ApiResponse(200, categories, "All Categories Fetched Successfully"));
})

const getAllCategoriesList = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).select("-__v -imageSource -iconSource -iconUrl -isSidebar -createdAt -updatedAt");
    return res.status(200).json(new ApiResponse(200, categories, "All Categories Fetched Successfully"));
})


// For Categories Page in dashboard
const getAllCategoryDashboard = asyncHandler(async (req, res) => {

    const { filterBy, page = 1, limit = 10, query } = req.query;

    const pipeline = [];

    pipeline.push({
        $match: {}
    })

    if (filterBy === "sidebar") {
        pipeline.push({
            $match: { isSidebar: true }
        })
    }

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


    pipeline.push({ $sort: { createdAt: -1 } })

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }


    const categories = await Category.aggregatePaginate(Category.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, categories, "All Categories Fetched Successfully"));
})

// Api For Category Popup shown in add games page and edit games page
const getAllCategoriesDashboardPopup = asyncHandler(async (req, res) => {

    const { query, alphabetquery } = req.query;

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

    if (alphabetquery) {
        pipeline.push({
            $match: {
                name: { $regex: `^${alphabetquery}`, $options: "i" }
            }
        });
    }


    const categories = await Category.aggregate(pipeline);

    return res.status(200).json(new ApiResponse(200, categories, "Categories Fetched Successfully"))
})


const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Id")
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, "No Category Found");
    }

    let imageUrl = category.imageUrl;
    let iconUrl = category.iconUrl;

    await Category.findByIdAndDelete(id);

    if (imageUrl && category.imageSource === "self") {
        await deleteFileFromDO(imageUrl);
    }

    if (iconUrl && category.iconSource === "self") {
        await deleteFileFromDO(iconUrl);
    }
    return res.status(200).json(new ApiResponse(200, category, "Category Deleted Successfully"));
})

const getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    return res.status(200).json(new ApiResponse(200, category, "Category Fetched Successfully"))
})

const editCategory = asyncHandler(async (req, res) => {
    const { slug, isSidebar, description } = req.body;
    let imageUrl = req.body.imageUrl || "";
    let imageSource = req.body.imageSource;
    let iconUrl = req.body.iconUrl;
    let iconSource = req.body.iconSource;
    const category = req.category;

    const slugFound = await Category.findOne({ slug, _id: { $ne: category._id } });
    if (slugFound) {
        throw new ApiError(400, "Slug Already Exists");
    }

    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;
    let iconImageUrl = req.files["icon"] ? req.files["icon"][0].location : null;


    if (uploadedImageUrl && category.imageSource === "self") {
        // delete previously uploaded category image 
        let categoryimageUrl = category?.imageUrl;
        await deleteFileFromDO(categoryimageUrl);
    }

    if (iconImageUrl && category.iconSource === "self") {
        // delete previously uploaded category icon
        let iconimageUrl = category?.iconUrl;
        await deleteFileFromDO(iconimageUrl);
    }

    if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
        imageSource = "self"
    }
    if (iconImageUrl) {
        iconUrl = iconImageUrl;
        iconSource = "self"
    }
    category.slug = slug;
    category.imageUrl = imageUrl;
    category.imageSource = imageSource;
    category.iconUrl = iconUrl;
    category.iconSource = iconSource;
    category.isSidebar = isSidebar;
    category.description = description;

    await category.save();

    return res.status(200).json(new ApiResponse(200, category, "Category Updated Successfully"));
})



export { createCategory, getAllCategory, deleteCategory, getById, editCategory, getAllCategoryDashboard, getAllCategoriesDashboardPopup, getAllCategoryWeb, getAllCategoriesList };