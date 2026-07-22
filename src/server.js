const app=require("./app");
const connectToDB=require("./config/db");
require("dotenv").config();

(async function start(){
    try {
        await connectToDB();
app.listen(process.env.PORT||3000,()=>{
  console.log("Server is live on http://localhost:3000");
  });

    } catch (err) {
        console.error("Failed to start server:", err.message);
    }
})()
