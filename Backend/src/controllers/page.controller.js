import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Page } from "../models/page.model.js";
import { isValidObjectId } from "mongoose";



const create = asyncHandler(async (req, res) => {
    const { name, slug, content } = req.body;

    if (!name || !slug || !content) {
        throw new ApiError(400, "Please Fill All Fields");
    }

    const page = await Page.create({ name, slug, content });

    return res.status(201).json(new ApiResponse(201, page, "Page Created Successfully"))
})

const getBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.query;
    const page = await Page.findOne({ slug });
    return res.status(200).json(new ApiResponse(200, page, "Page Fetched Successfully"));
})

const getAll = asyncHandler(async (req, res) => {
    const pages = await Page.find({}).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, pages, "Pages Fetched Successfully"));
})

const deletePage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Page Id");
    }

    const page = await Page.findById(id);

    if (!page) {
        throw new ApiError(404, "Page not found")
    }

    await Page.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, page, "Page Deleted Successfully"));
})

const editPage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Page Id");
    }
    const { name, slug, content } = req.body;

    if (!name || !slug || !content) {
        throw new ApiError(400, "All Fields are required");
    }

    const page = await Page.findById(id);

    if (!page) {
        throw new ApiError(404, "Page Not Found");
    }

    page.name = name;
    page.slug = slug;
    page.content = content;
    await page.save();

    return res.status(200).json(new ApiResponse(200, page, "Page Edited Successfully"));

})

export { create, getBySlug, getAll, deletePage, editPage }