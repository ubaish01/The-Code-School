import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Stats } from "../models/Stats.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendMail } from "../utils/sendMail.js";


export const contactUs = catchAsyncError(async (req, res, next) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message)
        return next(new ErrorHandler("Please provide all the inputs !", 400));

    const msg = `Hi my name is ${name} my email is ${email}.${message}`;
    const subject = "Contact Us";
    const sendTo = process.env.MY_MAIL;
    await sendMail(sendTo, subject, msg);

    res.status(201).json({
        success: true,
        message: "Your message has been sent to the admin !"
    })
})
export const requestcourse = catchAsyncError(async (req, res, next) => {
    const { name, email, course, courseDescription } = req.body;

    if (!name || !email || !course || !courseDescription)
        return next(new ErrorHandler("Please provide all the inputs !", 400));

    const msg = `Hi, My name is ${name} and my email is ${email}. \n 
    I am requesting for the course on ${course}.
    \n The detailed information of the course is mentioned below .
    \n ${courseDescription}
    `;
    const subject = "Request a course";
    const sendTo = process.env.MY_MAIL;
    await sendMail(sendTo, subject, msg);

    res.status(201).json({
        success: true,
        message: "We have admitted your course request , One of our team member will contact you in case we found your request worth.  !"
    })
})

export const getDashboardData = catchAsyncError(async (req, res, next) => {
    const stats = await Stats.find().sort({ createdAt: "desc" }).limit(12);

    const statsData = [];

    for (let i = 0; i < stats.length; i++) {
        statsData.unshift(stats[i]);
    }

    const requiredSize = 12 - stats.length;

    for (let i = 0; i < requiredSize; i++) {
        statsData.unshift({
            users: 0,
            subscriptions: 0,
            views: 0
        })
    }

    const usersCount = statsData[11].users;
    const subscriptionsCount = statsData[11].subscriptions;
    const viewsCount = statsData[11].views;

    let usersProfit = true;
    let subscriptionsProfit = true;
    let viewsProfit = true;

    let usersPercentage = 1;
    let subscriptionsPercentage = 1;
    let viewsPercentage = 1;


    const difference = {
        users: statsData[11].users - statsData[10].users,
        views: statsData[11].views - statsData[10].views,
        subscriptions: statsData[11].subscriptions - statsData[10].subscriptions
    }

    // console.log(statsData[11]);
    // console.log(statsData[10]);
    // console.log(difference);

    console.log(statsData[10]);


    if (statsData[10].users == 0)
        usersPercentage = usersCount * 100;
    else
        usersPercentage = (difference.users / statsData[10].users) * 100;
    if (statsData[10].views == 0)
        viewsPercentage = viewsCount * 100;
    else
        viewsPercentage = (difference.views / statsData[10].views) * 100;
    if (statsData[10].subscriptions == 0){
        console.log("i am here")
        subscriptionsPercentage = subscriptionsCount * 100;
    }
    else
        subscriptionsPercentage = (difference.subscriptions / statsData[10].subscriptions) * 100;

    console.log(subscriptionsPercentage);
    console.log(usersPercentage);
    console.log(viewsPercentage);



    if (usersPercentage < 0) usersProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionsPercentage < 0) subscriptionsProfit = false;


    res.status(200).json({
        success: true,
        stats: statsData,
        usersCount,
        subscriptionsCount,
        viewsCount,
        subscriptionsPercentage,
        viewsPercentage,
        usersPercentage,
        subscriptionsProfit,
        usersProfit,
        viewsProfit
    })
})