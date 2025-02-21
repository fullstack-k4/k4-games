import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse} from "../utils/ApiResponse.js";
import { Game } from "../models/game.model.js";
import mongoose, { isValidObjectId } from "mongoose";


const registerUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;


    if([email,password].some((field)=>!field || field.trim()==="")){
        throw new ApiError(400,"Please fill in all fields");
    }

    const existedUser=await User.findOne({email});

    if(existedUser){
        throw new ApiError(400,"User with email already exists");
    }

    const user=await User.create({
        email,
        password
    })

    const createdUser=await User.findById(user?._id);

    if(!createdUser){
        throw new ApiError(500,"Failed to Create User");
    }

    return res.status(201).json(new ApiResponse(201,createdUser,"Registered Successfully"))
})



const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;

    if([email,password].some((field)=>!field || field.trim()==="")){
        throw new ApiError(400,"Please fill in all fields");
    }

    const user=await User.findOne({email}).select("+password");

    if(!user){
        throw new ApiError(404,"User not found");
    }

    const isPasswordValid=await user.comparePassword(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid Password");
    }

    const jwtToken=await user.generateJwtToken();

    const options={
        httpOnly:true,
        secure:true,
        sameSite:"None",
        path:"/"
    }

    return res.status(200).cookie("jwtToken",jwtToken,options).json(new ApiResponse(200,user,"User Logged in Succesfullly"))
})



const logoutUser=asyncHandler(async(req,res)=>{
    const options={
        httpOnly:true,
        secure:true,
        sameSite:"None",
        expires:new Date(0),
        path:"/"
    }

    return res.status(200).cookie("jwtToken","",options).json(new ApiResponse(200,{},"User Logged Out Successfully"));
})


const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req?.user,"Current User Fetched Succesfully"));
})


const getAllSecondaryAdmin=asyncHandler(async(req,res)=>{
    const secondaryAdmins=await User.find({role:"secondaryAdmin"}).select("-password");

    if(!secondaryAdmins){
        throw new ApiResponse(404,"","No Secondary Admins Found");
    }

    return res.status(200).json(new ApiResponse(200,secondaryAdmins,"Secondary Admins Fetched Succesfully"));


})


const deleteSecondaryAdmin = asyncHandler(async (req, res) => {
    const { secondaryAdminsId } = req.params;

    if (!isValidObjectId(secondaryAdminsId)) {
        throw new ApiError(400, "Invalid Secondary Admin Id");
    }

    const secondaryAdmin = await User.findById(secondaryAdminsId);

    if (!secondaryAdmin) {
        throw new ApiError(404, "Secondary Admin Not Found");
    }

    await User.findByIdAndDelete(secondaryAdminsId);

    // Correcting the Game update logic
    await Game.updateMany({ createdBy: secondaryAdminsId }, { $unset: { createdBy: "" } });

    return res.status(200).json(new ApiResponse(200, secondaryAdmin, "Secondary Admin Deleted Successfully"));
});






export {loginUser,registerUser,logoutUser,getCurrentUser,getAllSecondaryAdmin,deleteSecondaryAdmin};
