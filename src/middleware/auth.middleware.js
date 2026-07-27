const jwt=require("jsonwebtoken");
const NotFoundError=require("../errors/NotFoundError");
const UnAuth=require("../errors/UnAuth");
const Service=require("../services")
const User=require("../models/user.model");
const authenticateUser=(req,res,next)=>{
  try {
  const token = req.cookies.accessToken || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    throw new NotFoundError("No Token Provided")
  }
   const data=jwt.verify(token,process.env.JWT_SECRET);
    req.user = data; 
    next();
  } catch (err) {
   next(err);
  }
}
const authorizeAdmin=async(req,res,next)=>{
try{
  const token=req.cookies.accessToken || req.headers["authorization"]?.split(" ")[1];
  const decode=jwt.verify(token,process.env.JWT_SECRET);
  if (!token) {
    throw new NotFoundError("No Token Provided");
  };
  const data=await User.findById(decode.userID);
  if(data.role!=="admin"){

    throw new UnAuth("User is not autherized !") ;
  }
  next();
}catch(err)
  {
  next(err);
  }
}

  

module.exports={authenticateUser,authorizeAdmin};
