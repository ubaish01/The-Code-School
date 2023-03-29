import Jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";


export const isAuthenticated = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token) return next(new ErrorHandler("You are not logged in ",401));

    const decoded = Jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);

    next();

})

export const isAuthorizedAdmin = (req,res,next) =>{
    if(req.user.role!=="admin")
    {
        return next(new ErrorHandler("You are not authorized for this action !",403))
    }

    next();
}

export const isPrimeUser = (req,res,next) =>{
    if(req.user.subscription.status!=="active" && req.user.role!=="admin")
    {
        return next(new ErrorHandler("Only premium users can access this resource !",403))
    }

    next();
}