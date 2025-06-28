import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Game } from "../models/game.model.js";
import { isValidObjectId } from "mongoose";
import admin from "../config/firebaseConfig.js"


const registerUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;


    if ([email, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(400, "User with email already exists");
    }

    const user = await User.create({
        email,
        password
    })

    const createdUser = await User.findById(user?._id);

    if (!createdUser) {
        throw new ApiError(500, "Failed to Create User");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "Registered Successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password");
    }

    const jwtToken = await user.generateJwtToken();

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
    }

    return res.status(200).cookie("jwtToken", jwtToken, options).json(new ApiResponse(200, user, "User Logged in Succesfullly"))
})

const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(0),
        path: "/"
    }

    return res.status(200).cookie("jwtToken", "", options).json(new ApiResponse(200, {}, "User Logged Out Successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req?.user, "Current User Fetched Succesfully"));
})

const getAllSecondaryAdmin = asyncHandler(async (req, res) => {
    const secondaryAdmins = await User.find({ role: "secondaryAdmin" }).select("-password");

    if (!secondaryAdmins) {
        throw new ApiResponse(404, "", "No Secondary Admins Found");
    }

    return res.status(200).json(new ApiResponse(200, secondaryAdmins, "Secondary Admins Fetched Succesfully"));


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

const sendNotificationToAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl } = req.body;

    if (!title || !body) {
        throw new ApiError(400, "Please Fill in All Fields")
    }

    const messageId = Date.now().toString();


    const message = {
        notification: {
            title,
            body,
            ...(imageUrl && { image: imageUrl })
        },
        data: {
            subscription: "normal",
            title,
            body,
            messageId: messageId,
            ...(imageUrl && { image: imageUrl })
        },
        topic: "all"
    };


    try {
        const response = await admin.messaging().send(message);
        return res.status(200).json({
            message: "Notification send successfully",
            response
        });
    } catch (error) {
        console.error("Error sending topic message:", error);
        return res.status(500).json({
            message: "Failed to send notification",
            error: error.message
        })

    }

})

const sendAdvertisementtoAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl, link } = req.body;

    if (!title || !body || !link) {
        throw new ApiError(400, "Please Fill in all fields")
    }

    const messageId = Date.now().toString();

    const message = {
        data: {
            subscription: "ads",
            data: link,
            title,
            body,
            image: imageUrl,
            urlLink: link,
            messageId
        },
        topic: "all"
    }

    try {
        const response = await admin.messaging().send(message);
        console.log("Advertisement Notification sent to topic all:", response);
        return res.status(200).json({
            message: "Notification sent successfully",
            response,
        })
    } catch (error) {
        console.error("Error sending topic message:", error);
        return res.status(500).json({
            message: "Failed to send notification",
            error: error.message
        })

    }

})

const sendGameNotificationtoAllUsers = asyncHandler(async (req, res) => {
    const { title, body, imageUrl, mediaData } = req.body;

    if (!title || !body || !imageUrl || !mediaData) {
        throw new ApiError(400, "Please fill in all fields")
    }

    const messageId = Date.now().toString();

    const mediaPayload = {
        _id: mediaData?._id,
        gameName: mediaData?.gameName,
        description: mediaData?.description,
        category: mediaData?.category,
        splashColor: mediaData?.splashColor,
        imageUrl: mediaData?.imageUrl,
        gameUrl: mediaData?.gameUrl,
        downloadable: mediaData?.downloadable,
        isloading: mediaData?.isloading,
        isrotate: mediaData?.isrotate,
        topTenCount: mediaData?.topTenCount,
        gameSource: mediaData?.gameSource,
        thumbnailSource: mediaData?.thumbnailSource,
        createdBy: mediaData?.createdBy,
        createdAt: mediaData?.createdAt,
        updatedAt: mediaData?.updatedAt,
        slug: mediaData?.slug,
        isFeatured: mediaData?.isFeatured,
        isRecommended: mediaData?.isRecommended,
        recommendedImageUrl: mediaData?.recommendedImageUrl,
        primaryCategory: mediaData?.primaryCategory,
    }

    const message = {
        data: {
            subscription: "play",
            screen: "GamePlayActivity",
            title,
            body,
            image: imageUrl,
            mediaData: JSON.stringify(mediaPayload),
            messageId
        },
        topic: "all"
    }


    try {
        const response = await admin.messaging().send(message);
        return res.status(200).json({
            message: "Notification sent successfully",
            response
        })
    } catch (error) {
        console.error("Error sending topic message:", error);
        return res.status(500).json({
            message: "Failed to send notification",
            error: error.message
        })
    }


})






export {
    loginUser, registerUser,
    logoutUser, getCurrentUser,
    getAllSecondaryAdmin, deleteSecondaryAdmin,
    sendNotificationToAllUsers, sendAdvertisementtoAllUsers,
    sendGameNotificationtoAllUsers
};
