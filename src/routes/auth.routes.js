const express =require("express");
const router=express.Router();
const auth=require("../controllers/auth.controller");
const admin=require("../controllers/admin.controller");
const authenticate=require("../middleware/auth.middleware");


router.post("/register",auth.register)
router.post("/login",auth.login)
router.post("/refresh",authenticate.authenticateUser ,auth.refreshToken)
router.post("/logout",authenticate.authenticateUser,auth.logout)
router.post("/logout-All",authenticate.authenticateUser,auth.logoutAll)
router.post("/delete/:sessionID",authenticate.authenticateUser,auth.deleteSession);

router.post("/delete/user",authenticate.authenticateUser,authenticate.authorizeAdmin,admin.deleteUserByID);



module.exports=router;