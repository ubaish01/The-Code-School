import mongoose from "mongoose";

export const ConnectDb = async()=>{
    const {connection} = await mongoose.connect(process.env.MONGO_CLOUD_URI);

    console.log(`database connected with ${connection.host}`)
}