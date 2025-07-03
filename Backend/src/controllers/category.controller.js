import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose"
import { Category } from "../models/category.model.js"
import { deleteFileFromDO } from "../utils/do.js"


const createCategory = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;

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
    const category = await Category.create({ name, imageUrl, imageSource, slug, iconUrl, iconSource });
    return res.status(201).json(new ApiResponse(201, category, "Category Created Successfully"));

})

const getAllCategory = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).select("-__v -imageSource -iconSource");
    return res.status(200).json(new ApiResponse(200, categories, "All Categories Fetched Successfully"));
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
    const { slug } = req.body;
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
    await category.save();

    return res.status(200).json(new ApiResponse(200, category, "Category Updated Successfully"));
})



export { createCategory, getAllCategory, deleteCategory, getById, editCategory };