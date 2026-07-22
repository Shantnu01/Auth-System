const User = require("../models/user.model");
const ConflictError = require("../errors/conflictError");
const NotFoundError =require("../errors/NotFoundError");
const UnAuth=require("../errors/UnAuth")
const jwt=require("jsonwebtoken")

const Session=require("../models/session.model");

class authService {

    static async checkEmailExists(data) {

        const existingUser = await User.findOne({
            email: data.email
        });

        if (existingUser) {
            throw new ConflictError("User already exists.");
        }

    }

    static async createUser(data) {

        const user = new User(data);

        return await user.save();

    }
    static async  checkUserCredentials(data,next){
      
      const email=data.email;
      const userData=await User.findOne({
            email: email
        }).select("+password");
      if(!userData){
        throw new NotFoundError("User Dont Exists.");
      }
      const pass=data.password;
      
     const result= await userData.comparePassword(pass);
     if(!result){
      throw new UnAuth("Invalid Creds")
     }
     return userData; 
    }
    static generateAccessToken(payload) {
    return jwt.sign(
      payload,                          
      process.env.ACCESS_TOKEN_SECRET,  
      { expiresIn: "15m" }              
    );
  }
  static generateRefreshToken(payload) {
    return jwt.sign(
      payload,                          
      process.env.REFRESH_TOKEN_SECRET,  
      { expiresIn: "30d" }              
    );
  }

  static createSession(payload){
cons
  }
  static checkExistingSession(refreshToken){
    
      const existingSession = await User.findOne({
            refreshToken
        });

    if (existingSession) {
            throw new ConflictError("Session already exists.");
        }
  }
  


  
  

}

module.exports = authService;