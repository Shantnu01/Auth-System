const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const sessionSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  deviceName: {
    type: String
  },
  lastUsedAt: {
    type: Date,
     default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
},{
    timestamps: true,
  });

// TTL index: auto-delete when expiresAt is reached
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware: set expiresAt = createdAt + 30 days
sessionSchema.pre("save", async function (next) {
  try{
  if (!this.expiresAt) {
    this.expiresAt = new Date(this.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
   if (!this.isModified("refreshToken")) return next();
 
   
    this.refreshToken=await bcrypt.hash(this.refreshToken,12);
    next();
  }
       catch (err) {
        next(err);
      }
    } 
);
sessionSchema.methods.compare=async function(refreshToken){
     return await bcrypt.compare(refreshToken,this.refreshToken);
  
}

module.exports = mongoose.model("Session", sessionSchema);
