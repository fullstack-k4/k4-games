import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";


export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.jwtToken || req.header("Authorization")?.replace("Beared","");
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
    
        if (!user) {
          throw new ApiError(401, "Invalid Acess Token");
        }
    
        req.user = user;
    
        next();
        
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid JWT Token")
        
    }

})


export const verifyAdmin=asyncHandler(async(req,_,next)=>{
    if(req.user.role!=="admin"){
        throw new ApiError(403,"Forbidden:Admins only");
    }

    next();
})