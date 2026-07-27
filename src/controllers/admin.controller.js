// const User = require("../models/user.model");
const {userValidator,refreshTokenValidator} = require("../validators/auth.validator");
const Service=require("../services/auth.service");
const AdminPow=require("../services/editAdmin.service");
const jwt=require("jsonwebtoken")
// const mongoose=require("mongoose");
// const Session = require("../models/session.model");
// const UnAuth = require("../errors/UnAuth");
const NotFoundError=require("../errors/NotFoundError");
const editAdmin=require("../services/editAdmin.service");

class admin{
  static deleteUserByID=async(req,res,next)=>{
    try{
    const token=req.cookies.accessToken;
    if(!token){
      throw new NotFoundError("Token Not Found!");
    }

    const decode=jwt.verify(token,process.env.JWT_SECRET);
    await editAdmin.deleteUser(decode.userID);  
    return res.status(200).json({
      status:"SuccessFull",
      message:"User Deleted!"
    })  
  
  }catch(err)
  {
    next(err);
  }
}}


module.exports=admin;