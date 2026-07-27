const express=require("express");
const health=require("./routes/health.routes");
const notFound=require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");
const authrouter=require("./routes/auth.routes");
// const authUser=require("./middleware/auth.middleware");
const app=express();

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(health);




app.use("/api/v1/auth",authrouter);
app.use(notFound);
app.use(errorHandler);
module.exports=app