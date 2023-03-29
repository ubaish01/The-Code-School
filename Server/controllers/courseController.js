import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js"
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary"
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";


export const getAllCourses = catchAsyncError(async (req, res, next) => {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    const foundCourses = await Course.find({
        title:{
            $regex:keyword,
            $options:'i'
        },
        category:{
            $regex:category,
            $options:'i'
        }

    }).select("-lectures");
    res.status(200)
        .json({
            success: true,
            courses: foundCourses
        })
});
export const createCourse = catchAsyncError(async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;
    const file = req.file;

    if (!title || !description || !category || !createdBy || !file)
        return next(new ErrorHandler("Please fill All the inputs !", 400));

    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })

    res.status(201)
        .json({
            success: true,
            message: "Course created successfullt ! You can add videos now !"
        })
});

export const getCourseLectures = catchAsyncError(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if (!course)
        return next(new ErrorHandler("Invalid course id !", 404));

    course.views += 1;
    await course.save();



    res.status(200).json({
        status: true,
        lectures: course.lectures
    })
})


export const addLecture = catchAsyncError(async (req, res, next) => {
    const { id } = req.params.id;
    const { title, description } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course)
        return next(new ErrorHandler("Invalid course id !", 404));

    const file = req.file;
    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content,{resource_type:"video"});

    course.lectures.push({
        title,
        description,
        video: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })

    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        status: true,
        message: "Lecture added successfully"
    })
})

export const deleteCourse = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const course = await Course.findById(id);
    if(!course)
        return next(new ErrorHandler("Course not found !",404));

    await cloudinary.v2.uploader.destroy(course.poster.public_id);

    course.lectures.forEach(async(lecture) => {
        await cloudinary.v2.uploader.destroy(lecture.video.public_id,{resource_type:"video"});
    });

    await Course.deleteOne(course);
    

    res.status(200)
        .json({
            success: true,
            message: "Course deleted successfully "
        })
});
export const deleteLecture = catchAsyncError(async (req, res, next) => {
    const { courseId,lectureId } = req.query;

    const course = await Course.findById(courseId);
    if(!course)
        return next(new ErrorHandler("Course not found !",404));

        // console.log(course.lectures[0]._id.toString())
        // console.log(lectureId)


        const lecture = course.lectures.find((item)=>{

            if(item._id.toString() === lectureId.toString()) return item;
        });
        
        console.log(lecture);

    await cloudinary.v2.uploader.destroy(lecture.video.public_id,{resource_type:"video"});

    course.lectures = course.lectures.filter((item)=>{
        if(item._id.toString()!==lecture._id.toString()) return item;
    })

    course.numOfVideos = course.lectures.length;

    await course.save();    

    res.status(200)
        .json({
            success: true,
            message: "Lecture deleted successfully "
        })
});


Course.watch().on("change",async()=>{
    console.log("Views updated")
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
    const courses = await Course.find({});

    let totalViews = 0;

    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        totalViews += course.views;
    }

    stats[0].views = totalViews;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
})