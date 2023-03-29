import express from "express"
import { createCourse, getAllCourses,addLecture, getCourseLectures, deleteCourse, deleteLecture  } from "../controllers/courseController.js";

import { isAuthenticated, isAuthorizedAdmin, isPrimeUser } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
const router = express.Router();



// GET ALL COURSES WITHOUR LECTURES - PUBLIC
router.get("/",getAllCourses)

// GET LECTURES - PRIME USERS ONLY 
router.get("/lectures/:id",isAuthenticated,isPrimeUser,getCourseLectures)


// CREATE A NEW COURSE - ADMIN ONLY 
router.post("/create",isAuthenticated,isAuthorizedAdmin,singleUpload,createCourse);

// DELETE COURSE - ADMIN ONLY 
router.delete("/delete/:id",isAuthenticated,isAuthorizedAdmin,deleteCourse);

// ADD LECTURES - ADMIN ONLY 
router.post("/lectures/:id",isAuthenticated,isAuthorizedAdmin,singleUpload,addLecture);

// DELETE LECTURE - ADMIN ONLY 
router.delete("/lectures",isAuthenticated,isAuthorizedAdmin,deleteLecture);



export default router