import mongoose from "mongoose";
import validator from "validator";
import Jwt from "jsonwebtoken";
import bcrpyt from 'bcrypt'
import crypto from "crypto"

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name can not be empty"]
    },
    email: {
        type: String,
        required: [true, "email can not be empty"],
        unique: true,
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: [true, "Password can not be empty"],
        minLength: [6, "Password must be of more than 6 characters"],
        select: false
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    subscription: {
        id: String,
        status: String
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    playlist: [
        {
            course:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course"
            },
            poster:String
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    resetpasswordtoken:String,
    resetpasswordexpire:String
})

schema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrpyt.hash(this.password,10);
    next(); 
    
})

schema.methods.getJWTToken = function(){
    return Jwt.sign({_id:this._id},process.env.JWT_SECRET,{
        expiresIn:"15d"
    }) 
}

schema.methods.comparePassword = function(password){
    return bcrpyt.compare(password,this.password);
}

schema.methods.getResetToken = function(password){
    const resetToken =  crypto.randomBytes(20).toString("hex");
    this.resetpasswordtoken =  crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetpasswordexpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}



export const User = mongoose.model("User",schema);
