const User = require("../models/user.model");
const ConflictError = require("../errors/conflictError");
const NotFoundError =require("../errors/NotFoundError");
const UnAuth=require("../errors/UnAuth")
const jwt=require("jsonwebtoken")
const Session=require("../models/session.model");

const client=require("../config/redis");

class authService {

    static async checkEmailExists(data) { //no need to return anythin if it runs without error means the Email exists!!!!

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

  static async createSession(payload){
const session =new Session(payload);
return await session.save();
  }
  
static async checkExistingSession(refreshToken){
    const data=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
      const existingSession = await Session.findById(
            data.sessionID
        );

    if (!existingSession) {
            throw new NotFoundError("Session dont exist.");
        }
         return existingSession;
  }
  
static async  checkAllExistingSessions(refreshToken){
  
  const data=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
  const userID=data.userID;
  const allSessions=await Session.find({userID:userID}).select("-refreshToken");
   if (!allSessions || allSessions.length === 0) {
      throw new NotFoundError("No Session Found!");
    }

    return allSessions;
  }
 



static async deleteSession(refreshToken){

    const session = await this.checkExistingSession(refreshToken);

    return await Session.findByIdAndDelete(session._id);

}

static async deleteMultipleSessions(refreshToken){
  const data=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
  const userID=data.userID;

  if (!userID) 
  {
    throw new UnAuth("Invalid Refresh Token");
  }
  
  return await Session.deleteMany({userID:userID});
} 
}

module.exports = authService;