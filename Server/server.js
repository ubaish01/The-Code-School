import app from "./app.js";
import { ConnectDb } from "./config/database.js";
import cloudinary from "cloudinary"
import Razorpay from "razorpay";
import { Stats } from "./models/Stats.js";
import nodeCron from "node-cron"




cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLIENT_NAME,
    api_key:process.env.CLOUDINARY_CLIENT_API_KEY,
    api_secret:process.env.CLOUDINARY_CLIENT_API_SECRET
})


// HERE MIGHT BE AN ERROR BECAUSE OF THE IMPORT RAZORPAY 
export const instance = new Razorpay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret:process.env.RAZORPAY_API_SECRET
})

const createNewStats = async()=>{
    await Stats.create({});

    console.log("New stat is created");
}

nodeCron.schedule("0 0 0 1 * *",()=>{
    createNewStats();
})


app.listen(process.env.PORT,()=>{
    ConnectDb();
    console.log("Working on port "+process.env.PORT);
})

