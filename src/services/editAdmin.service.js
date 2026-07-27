const User = require("../models/user.model");
const ConflictError = require("../errors/conflictError");
const NotFoundError =require("../errors/NotFoundError");
const UnAuth=require("../errors/UnAuth")
const jwt=require("jsonwebtoken")
const Session=require("../models/session.model");


const deleteUser=async(userID)=>{

  const user=await User.findById(userID);
  if(!user){
    throw new NotFoundError("User Not Found!");
  }
  await User.findByIdAndDelete(user._id);
}
module.exports={
  deleteUser
}