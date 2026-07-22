// const User = require("../models/user.model");
const Validator = require("../validators/auth.validator");
const Service=require("../services/auth.service");
const jwt=require("jsonwebtoken")
const 
class authController {
  static register = async (req, res, next) => {
    try {
    
     
      const data = Validator.parse(req.body);

      await Service.checkEmailExists(data);
     
      await Service.createUser(data);

      return res.status(201).json({
        success: true,
        message: "User registered successfully."
      });
    } catch (err) {
      
      next(err);
    }
  };

  static login=async(req,res,next)=>{
    try{
    const data = Validator.parse(req.body);
    const userData=await Service.checkUserCredentials(data);
    const accessToken=Service.generateAccessToken({
      userID:userData._id,
      email:userData.email,
      issuedAt: new Date().toISOString()
    });
    const refreshToken=Service.generateRefreshToken({
      userID=userData._id
    })
    res.cookie("accessToken", accessToken, {
      httpOnly: true,     
      secure: true,       
      sameSite: "strict",  
      maxAge:  15 * 60 * 1000
    });
     res.cookie("refreshToken",refreshToken, {
      httpOnly: true,     
      secure: true,       
      sameSite: "strict", 
      maxAge: 30 * 24 * 60 * 60 * 1000 
     
    });
    
    return res.status(200).json({
      success: true,
      message: "Login successful"
    });
    }
    catch(err){
      next(err);
    }
}
// static logout=async(req,res,next)=>{
//   try{

//   }
// }
}
module.exports = authController;
