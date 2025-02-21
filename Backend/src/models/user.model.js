import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique:true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
        minLength:[8,"Password must be of length 8"]
    },
    role: {
        type: String,
        enum: ["admin", "secondaryAdmin"],
        default: "secondaryAdmin"
    }
},{timestamps:true})

// function to hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
})

// function to check password is correct or not
userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

// function to genrate Jwt Token

userSchema.methods.generateJwtToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
        },
        process.env.JWT_TOKEN_SECRET,
        {
            expiresIn:process.env.JWT_TOKEN_EXPIRY
        }
    )
}


// function to check logged in user is admin or not
userSchema.methods.isAdmin=function(){
    return this.role==="admin";
}


export const User = mongoose.model("User", userSchema);