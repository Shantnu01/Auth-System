const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now, // auto-set when created
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// TTL index: auto-delete when expiresAt is reached
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware: set expiresAt = createdAt + 30 days
sessionSchema.pre("save", async function (next) {
  try{
  if (!this.expiresAt) {
    this.expiresAt = new Date(this.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  if(refreshToken.ismodified())
  {
    const hash =await bcrypt.hash(this.refreshToken,12);
    this.refreshToken=hash;
     
        next();}}
       catch (err) {
        next(err);
      }
    } 
);
sessionSchema.method.compare=async(sessionID)=>{
     return await bcrypt.compare(sessionID,this._id);
  
}

module.exports = mongoose.model("Session", sessionSchema);
