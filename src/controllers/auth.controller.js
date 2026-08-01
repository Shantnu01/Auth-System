// const User = require("../models/user.model");
const {userValidator,refreshTokenValidator,sendOtpValidator} = require("../validators/auth.validator");
const Service=require("../services/auth.service");
const jwt=require("jsonwebtoken")
const mongoose=require("mongoose");
const Session = require("../models/session.model");
const UnAuth = require("../errors/UnAuth");
const emailService=require("../services/otp.service")
const BadReq=require("../errors/BadRequestError")


class authController {
  static sendOtp = async (req, res, next) => {
    try {
      const data = sendOtpValidator.parse(req.body);
      await Service.checkEmailExists(data);
      await emailService.sendOtp(req, data.email);

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email."
      });
    } catch (err) {
      next(err);
    }
  };

  static resendOtp = async (req, res, next) => {
    try {
      const data = sendOtpValidator.parse(req.body);
      await emailService.resendOtp(req, data.email);

      return res.status(200).json({
        success: true,
        message: "New OTP sent successfully to your email."
      });
    } catch (err) {
      next(err);
    }
  };

  static register = async (req, res, next) => {
    try {
      const data = userValidator.parse(req.body);

      await Service.checkEmailExists(data);
      const result = await emailService.checkOtp(req, data.email, data.otp);
      if (!result)
        throw new BadReq("Register failed!");

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
    const data = userValidator.parse(req.body);
    const userData=await Service.checkUserCredentials(data);
    const accessToken=Service.generateAccessToken({
      userID:userData._id,
      email:userData.email,
      issuedAt: new Date().toISOString()
    });

  const sessionId = new mongoose.Types.ObjectId();

  const refreshToken = Service.generateRefreshToken({
    userID: userData._id,
    sessionID: sessionId
  });

await Session.create({
    _id: sessionId,
    userID: userData._id,
    refreshToken,
    ipAddress: req.ip,                  
    userAgent: req.headers["user-agent"], 
    deviceName: req.device?.name || "Unknown", 
    lastUsedAt: new Date(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
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

static refreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      throw new UnAuth("Refresh token missing");
    }

    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const data = refreshTokenValidator.parse(decoded);

    const session = await Service.checkExistingSession(oldRefreshToken);

    const valid = await session.compare(oldRefreshToken);

    if (!valid) {
      throw new UnAuth("Invalid Refresh Token");
    }

    // Delete old session (Refresh Token Rotation)
    await Service.deleteSession(oldRefreshToken);

    // Create a new session id
    const sessionId = new mongoose.Types.ObjectId();

    // Generate new refresh token
    const newRefreshToken = Service.generateRefreshToken({
      userID: data.userID,
      sessionID: sessionId,
    });
    const refreshTokenExpiry = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
);

    // Store new session
    await Service.createSession({
      _id: sessionId,
      userID: data.userID,
      refreshToken: newRefreshToken,
      expiresAt: refreshTokenExpiry,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      deviceName: req.headers["user-agent"], // Replace with ua-parser-js later
    });

    // Generate new access token
    const accessToken = Service.generateAccessToken({
      userID: data.userID,
      issuedAt: new Date().toISOString(),
    });

    // Update cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

static AllSessions=async(req,res,next)=>{
  try{
  const sessions=await Service.checkAllExistingSessions(req.cookies.refreshToken);
  return res.status(200).json({
    status:200,
    success:true,
    message:"All sessions !",
    sessions:sessions
  }
  )
  }catch(err){
    next(err);
  }

}

static logout=async(req,res,next)=>{
  try{
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) 
    {
      throw new UnAuth("Refresh token missing");
    }

    const decoded = jwt.verify
    (
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // const data = refreshTokenValidator.parse(decoded);

    const session = await Service.checkExistingSession(oldRefreshToken);

    const valid = await session.compare(oldRefreshToken);

    if (!valid) {
      throw new UnAuth("Invalid Refresh Token");
    }

    await Service.deleteSession(oldRefreshToken);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    next(error);
  }
}

static logoutAll=async(req,res,next)=>{
  try{
   const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) 
    {
      throw new UnAuth("Refresh token missing");
    }
    await Service.deleteMultipleSessions(oldRefreshToken);
    res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
});

   res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
});
   return res.status(200).json({
    success: true,
    message: "Logged out from all devices."
});
  }
  catch(error){
    next(error);
  }
}

static deleteSession=async(req,res,next)=>
{
  try{
  const sessionId=req.params.sessionID;
  const refreshToken=req.cookies.refreshToken;
  const decoded=jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const existingSession = await Session.findById(
             sessionId
         );
 
     if (!existingSession) {
             throw new NotFoundError("Session dont exist.");
         }
  if(existingSession.userID.toString() !== decoded.userID){
    throw new UnAuth("Not autherised to do so!")
  }
  await Session.findByIdAndDelete(sessionId);
  res.status(200).json({
      success: true,
      message: "Session deleted successfully"
    })
        }catch(err){
          next(err);
        }

}
}

module.exports = authController;
