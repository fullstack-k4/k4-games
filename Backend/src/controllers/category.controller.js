import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose"
import { Category } from "../models/category.model.js"
import { deleteFileFromDO } from "../utils/do.js"


const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, isSidebar, description, gradientColor1, gradientColor2, order } = req.body;

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
    const category = await Category.create({ name, imageUrl, imageSource, slug, iconUrl, iconSource, isSidebar, description, gradientColor1, gradientColor2, order });
    return res.status(201).json(new ApiResponse(201, category, "Category Created Successfully"));

})

const getAllCategory = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).select("-__v -imageSource -iconSource");
    return res.status(200).json(new ApiResponse(200, categories, "All Categories Fetched Successfully"));
})

// For Sidebar in website
const getAllCategoryWeb = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isSidebar: true }).select("-__v -imageSource -iconSource").sort({ order: 1, name: 1 });
    return res.status(200).json(new ApiResponse(200, categories, "All Categories Fetched Successfully"));
})

// for websites all categories page
const getAllCategoriesList = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;

    const pipeline = [];

    pipeline.push({
        $match: {}
    })

    // sort by order and then name
    pipeline.push({
        $sort: { order: 1, name: 1 }
    });

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }


    const categories = await Category.aggregatePaginate(Category.aggregate(pipeline), options);

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


    pipeline.push({ $sort: { createdAt: -1, _id: -1 } })

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
        if (alphabetquery === "#") {
            pipeline.push({
                $match: {
                    $or: [
                        // names starting with non-alphabet characters
                        { name: { $regex: '^[^A-Za-z]', $options: '' } },
                        // OR names that are null/empty
                        { name: { $in: [null, ""] } }
                    ]
                }
            });
        } else {
            pipeline.push({
                $match: {
                    name: { $regex: `^${alphabetquery}`, $options: "i" }
                }
            });
        }
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
    const { slug, isSidebar, description, gradientColor1, gradientColor2 } = req.body;
    let imageUrl = req.body.imageUrl || "";
    let iconUrl = req.body.iconUrl;
    let order = req.body.order

    const category = req.category;

    let uploadedImageUrl = req.files["image"] ? req.files["image"][0].location : null;
    let uploadediconImageUrl = req.files["icon"] ? req.files["icon"][0].location : null;


    if (uploadedImageUrl && category.imageSource === "self") {
        // delete previously uploaded category image 
        let categoryimageUrl = category?.imageUrl;
        await deleteFileFromDO(categoryimageUrl);
    }

    if (uploadediconImageUrl && category.iconSource === "self") {
        // delete previously uploaded category icon
        let iconimageUrl = category?.iconUrl;
        await deleteFileFromDO(iconimageUrl);
    }

    if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
    }


    if (uploadediconImageUrl) {
        iconUrl = uploadediconImageUrl;
    }

    if (!imageUrl.includes("digitalocean") && category.imageUrl.includes("digitalocean") && !uploadedImageUrl) {
        // which means image is edited via url and previous image was uploaded on digital ocean
        // delete previous image

        await deleteFileFromDO(category.imageUrl);
    }

    if (!iconUrl.includes("digitalocean") && category.iconUrl.includes("digitalocean") && !uploadediconImageUrl) {
        // which means icon is edited via url and previous icon was uploaded on digital ocean
        // delete previous icon

        await deleteFileFromDO(category.iconUrl);
    }


    category.slug = slug;
    category.imageUrl = imageUrl;
    category.iconUrl = iconUrl;
    category.isSidebar = isSidebar;
    category.description = description;
    category.gradientColor1 = gradientColor1;
    category.gradientColor2 = gradientColor2;
    category.order = order;

    if (imageUrl.includes("digitalocean")) {
        category.imageSource = "self"
    }
    else {
        category.imageSource = "link"
    }

    if (iconUrl.includes("digitalocean")) {
        category.iconSource = "self"
    }
    else {
        category.iconSource = "link"
    }

    await category.save();

    return res.status(200).json(new ApiResponse(200, category, "Category Updated Successfully"));
})

const checkSlugAvailability = asyncHandler(async (req, res) => {
    const { slug, categoryId } = req.query;

    if (!slug) {
        return res.status.json({
            status: 400,
            message: "Slug is required"
        })
    }

    const slugFound = await Category.findOne({ slug });

    // If Slug is found and does not belong to the current category

    if (slugFound && slugFound._id.toString() !== categoryId) {
        return res.status(200).json(new ApiResponse(200, true, "Slug already exists"));
    }

    // Slug is either not found or belongs to the same category
    return res.status(200).json(new ApiResponse(200, false, "Slug is available"));
})



export {
    createCategory, getAllCategory, deleteCategory,
    getById, editCategory, getAllCategoryDashboard,
    getAllCategoriesDashboardPopup, getAllCategoryWeb,
    getAllCategoriesList, checkSlugAvailability
};