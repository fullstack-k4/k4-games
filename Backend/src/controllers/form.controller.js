import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose";
import { Form } from "../models/form.model.js";
import {deleteFileFromDO} from "../utils/do.js"




const createForm=asyncHandler(async(req,res)=>{
    const {name,email,phoneNumber,description}=req.body;



    if(!name || !email || !phoneNumber || !description){
        throw new ApiError(400,"Please fill all fields");
    }

    let uploadedAttachmentUrl= req.file ? req.file.location : null;
    const form =await Form.create({
        name,
        email,
        phoneNumber,
        description,
        attachmentUrl:uploadedAttachmentUrl
    })

    if(!form){
        throw new ApiError(500,"Failed to create form");
    }


    return res.status(201).json(new ApiResponse(201,form,"Form Created Successfully"))

})



const deleteForm=asyncHandler(async(req,res)=>{
    const {id}=req.params;

    if(!isValidObjectId(id)){
        throw new ApiError(400,"Invalid Id");
    }

    const form=await Form.findByIdAndDelete(id);

    let attachmentUrl=form.attachmentUrl;

    if(attachmentUrl){
        attachmentUrl=attachmentUrl.replace(`${process.env.DIGITALOCEAN_ENDPOINT}/${process.env.DIGITALOCEAN_BUCKET_NAME}/`,"")
        await deleteFileFromDO(attachmentUrl);
    }

    if(!form){
        throw new ApiError(404,"Form not found");
    }


    return res.status(200).json(new ApiResponse(200,form,"Form Deleted Successfully"));
})



const getAllForms = asyncHandler(async (req, res) => {
    const {  page = 1, limit = 10 } = req.query;


    const aggregationPipeline = [
        {
            $match:{}
        },
        { $sort: { createdAt: -1 } } // Sort by latest
    ]

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const paginatedForms = await Form.aggregatePaginate(Form.aggregate(aggregationPipeline), options);

    return res.status(200).json(new ApiResponse(200, paginatedForms, "All Forms Fetched Successfully"));
});






export {createForm,deleteForm,getAllForms}




