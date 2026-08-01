const jwt=require("jsonwebtoken");
const NotFoundError=require("../errors/NotFoundError");
const UnAuth=require("../errors/UnAuth");
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
  if (!token) {
    throw new NotFoundError("No Token Provided");
  }
  const decode=jwt.verify(token,process.env.JWT_SECRET);
  const data=await User.findById(decode.userID);
  if(!data || data.role!=="admin"){
    throw new UnAuth("User is not autherized !") ;
  }
  next();
}catch(err)
  {
  next(err);
  }
}

  

module.exports={authenticateUser,authorizeAdmin};
