import cookieParser from 'cookie-parser';
import express, { urlencoded } from 'express';
import {config} from 'dotenv'
import ErrorMiddleware from "./middlewares/Error.js"
import cors from 'cors'

config({
    path:'./config/config.env'
});

const app = express()

//Using middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded(
    {
        extended:true
    }
));
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]
}))




//Imports and routes 
import courseRoutes from "./routes/courseRoutes.js"
import userRoutes from "./routes/userRouter.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import otherRoutes from "./routes/otherRoutes.js"



app.use("/api/v1/courses",courseRoutes);
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/subscribe",paymentRoutes)
app.use("/api/v1/other",otherRoutes)

export default app

app.use(ErrorMiddleware)