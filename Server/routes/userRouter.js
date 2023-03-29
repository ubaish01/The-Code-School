import express from "express"
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, register, removeFromPlaylist, resetpassword, updateProfile, updateProfilePicture, updateUserRole } from "../controllers/userController.js";
import { isAuthenticated, isAuthorizedAdmin } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

//REGISTER
router.post("/register",singleUpload,register);

// LOGIN
router.post("/login",login);

// LOGOUT
router.get("/logout",logout);

// GET MY PROFILE 
router.get("/me",isAuthenticated,getMyProfile);

// CHANGE PASSWORD
router.put("/changepassword",isAuthenticated,changePassword);

// UPDATE PROFILE
router.put("/updateprofile",isAuthenticated,updateProfile);

// UPDATE PROFILE PICTURE 
router.put("/updateprofilepicture",isAuthenticated,singleUpload,updateProfilePicture);

// FORGET PASSWORD
router.post("/forgetpassword",forgetPassword);
// RESET PASSWORD
router.put("/resetpassword/:token",resetpassword);

// ADD TO PLAYLIST 
router.post("/addtoplaylist",isAuthenticated,addToPlaylist);

// REMORE FROM PLAYLIST
router.delete("/removefromplaylist",isAuthenticated,removeFromPlaylist);

// GET ALL USERS -> ADMIN
router.get("/admin/users",isAuthenticated,isAuthorizedAdmin,getAllUsers);

// UPDATE USER ROLE -> ADMIN
router.put("/admin/updaterole/:id",isAuthenticated,isAuthorizedAdmin,updateUserRole);

// DELETE A USER -> ADMIN
router.delete("/admin/deleteuser/:id",isAuthenticated,isAuthorizedAdmin,deleteUser);

// DELETE MY PROFILE -> USER
router.delete("/deleteprofile",isAuthenticated,deleteMyProfile);

export default router