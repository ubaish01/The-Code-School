export const sendToken = (res,user,message,status=200) =>{

    const token = user.getJWTToken();
    const options = {
        expires:new Date(Date.now() + 15 * 24 * 60 * 60 * 100 ),
        httpOnly:true,
        secure:true,
        sameSite:"none"

    }

    res.status(201).cookie("token",token,options).json({
        success:true,
        user,
        message 
    });
}