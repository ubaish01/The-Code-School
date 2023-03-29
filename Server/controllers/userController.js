import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto"
import { Course } from "../models/Course.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";


export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const file = req.file;

    if (!name || !email || !password || !file) {
        return next(new ErrorHandler("Please fill all the inputs ", 400));
    }
    const foundUser = await User.findOne({ email });

    if (foundUser)
        return next(new ErrorHandler("User already exist!", 409));

    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })

    sendToken(res, user, "Registered Successfully", 201);
})


export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please fill all the inputs ", 400));
    }
    const foundUser = await User.findOne({ email }).select("+password");

    if (!foundUser)
        return next(new ErrorHandler("Email or password is incorrect !", 401));

    const matched = await foundUser.comparePassword(password);

    if (!matched)
        return next(new ErrorHandler("Email or password is incorrect !", 401));

    sendToken(res, foundUser, `welcome back, ${foundUser.name}`, 200);
})


export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now())
    })
        .json({
            success: true,
            message: "Logged out successfully !"
        })
})

export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200)
        .json({
            success: true,
            user
        })
})

export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please fill all the inputssss ", 400));
    }
    const user = await User.findById(req.user._id).select("+password");

    const isMatched = await user.comparePassword(oldPassword);

    if (!isMatched)
        return next(new ErrorHandler("Incorrect old password ", 400));

    user.password = newPassword;
    await user.save();
    res.status(200)
        .json({
            success: true,
            message: "Password updated succesfully"
        })
})
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.status(200)
        .json({
            success: true,
            message: "Profile updated succesfully"
        })
})
export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
    const file = req.file;
    const user = await User.findById(req.user._id);


    if(!file) return next (new ErrorHandler("Please provide all the required inputs",400));

    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id:myCloud.public_id,
        url:myCloud.secure_url
    }

    await user.save();

    res.status(200)
        .json({
            success: true,
            message: "Profile picture updated succesfully"
        })
})

export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) return next(new ErrorHandler("Please fill all the inputs", 400));

    const user = await User.findOne({ email });

    if (!user)
        return next(new ErrorHandler("User not found !", 400));

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Ciick on the link to reset your password . ${url}. If you have not requested then ignore .`

    await sendMail(
        user.email,
        "Reset Password",
        message
    )

    res.status(200)
        .json({
            success: true,
            message: `Reset link has been sent to ${email}`
        })
})

export const resetpassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;

    // const resetPasswordToken = crypto
    // .createHash("sha256")
    // .update(token)
    // .digest("hex");

    const resetpasswordtoken = crypto.createHash("sha256").update(token).digest("hex");

    // console.log(resetPasswordToken);

    const user = await User.findOne({
        resetpasswordtoken,
        resetpasswordexpire: {
            $gt: Date.now(),
        },
    });


    if (!user)
        return next(new ErrorHandler("Token is invalid or has been expired !"));

    user.password = req.body.password;
    user.resetpasswordtoken = undefined
    user.resetpasswordexpire = undefined

    await user.save();

    res.status(200).json(
        {
            success: true,
            message: "password changed succesfully",
        }
    )

})

export const addToPlaylist = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body.id);

    if (!course)
        return next(new ErrorHandler("Course not found !", 404));

    const itemExist = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString()) return true;
    })

    if (itemExist)
        return next(new ErrorHandler("Item already exist", 409))

    user.playlist.push({
        course: course._id,
        poster: course.poster.url
    })

    await user.save();

    res.status(200).json({
        status: true,
        message: "Added to playlist "
    })
})

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {

    const user = req.user;

    const course = await Course.findById(req.query.id);

    if (!course)
        return next(new ErrorHandler("Invalid course id !", 404));

    const newPlaylist = user.playlist.filter((item) => {
        if (item.course.toString() !== course._id.toString()) return item;
    })

    user.playlist = newPlaylist;

    await user.save();

    res.status(200).json({
        status: true,
        message: "Removed from playlist"
    })
})
export const getAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({
        status: true,
        users
    })
})
export const updateUserRole = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user)
        return next(new ErrorHandler("User not found !",404));
    
    if(user.role==="admin") user.role = "user"
    else user.role = "admin"

    await user.save();

    res.status(200).json({
        status: true,
        message:`Role updated to ${user.role}`
    })
})

export const deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user)
        return next(new ErrorHandler("User not found !",404));
    
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    
    await user.deleteOne();
    
    res.status(200).json({
        status: true,
        message:`User ${user.email} deleted successfully `
    })
})
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
    
    const user = await User.findById(req.user._id);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    
    await user.deleteOne();

    res.status(200)
    .cookie("token",null,{
        expires:new Date(Date.now())
    })
    .json({
        status: true,
        message:`Profile deleted successfully  `
    })
})


User.watch().on("change", async ()=>{
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
    const subscription = await User.find({"subscription.status":"active"});
    console.log("Watch o change called")
    stats[0].users = 5;
    // stats[0].users = await User.countDocuments();
    stats[0].subscriptions = subscription.length;
    stats[0].createdAt = new Date(Date.now())

    await stats[0].save();
})



