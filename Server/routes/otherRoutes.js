import express from "express"
import { contactUs, getDashboardData, requestcourse } from "../controllers/otherController.js";
import { isAuthenticated, isAuthorizedAdmin } from "../middlewares/auth.js";


const router = express.Router();
//CONTACT US 
router.post("/contactus",isAuthenticated,contactUs);

//REQUEST A COURSE 
router.post("/requestcourse",isAuthenticated,requestcourse);

//REQUEST A COURSE 
router.get("/stats",isAuthenticated,isAuthorizedAdmin,getDashboardData);

export default  router