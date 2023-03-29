import express from "express"
import { buySubscription, cancelSubscription, getRazorpayKey, paymentVerification } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//BUY SUBSCRIPTION
router.get("/",isAuthenticated,buySubscription);

//CANCEL SUBSCRIPTION 
router.delete("/cancel",isAuthenticated,cancelSubscription);

// VERIFYING PAYMENT AND STORING THE REFERENCE TO THE DATABASE FOR REFUND PROCESS IF NEEDED 
router.post("/verification",isAuthenticated,paymentVerification);

// GETTING THE RAZORPAY API KEY 
router.get("/key",isAuthenticated,getRazorpayKey);



export default router