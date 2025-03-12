import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose"
import { Category } from "../models/category.model.js"
import {deleteFileFromDO} from "../utils/do.js"



const createCategory=asyncHandler(async(req,res)=>{
    const {name}=req.body;

    let imageUrl=req.body.imageUrl || "";
    let imageSource;

    let uploadedImageUrl=req.file ? req.file.location :null;
    console.log(uploadedImageUrl);


    if(uploadedImageUrl){
        imageUrl=uploadedImageUrl;
        imageSource="self"
    }

    if(!name){
        throw new ApiError(400,"Please fill in all fields");
    }
    const category=await Category.create({name,imageUrl,imageSource});
    return res.status(201).json(new ApiResponse(201,category,"Category Created Successfully"));

})


const getAllCategory=asyncHandler(async(req,res)=>{
   const categories=await Category.find({}).select("-__v -imageSource");
   return res.status(200).json(new ApiResponse(200,categories,"All Categories Fetched Successfully"));
})


const deleteCategory=asyncHandler(async(req,res)=>{
    const {id}=req.params;

    if(!isValidObjectId(id)){
        throw new ApiError(400,"Invalid Id")
    }

    const category=await Category.findById(id);

    if(!category){
        throw new ApiError(404,"No Category Found");
    }

    let imageUrl=category.imageUrl;

    await Category.findByIdAndDelete(id);

    if(imageUrl && category.imageSource==="self"){
        await deleteFileFromDO(imageUrl);
    }
    return res.status(200).json(new ApiResponse(200,category,"Category Deleted Successfully"));
})


export {createCategory,getAllCategory,deleteCategory};