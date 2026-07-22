const express =require("express");
const router=express.Router();
router.get("/",(req,res)=>{
  return res.status(400).json({
    "success": true,
    "message": "Auth Lab API is running"
  })
})

module.exports=router;