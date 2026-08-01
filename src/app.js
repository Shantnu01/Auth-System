const express=require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const health=require("./routes/health.routes");
const notFound=require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");
const authrouter=require("./routes/auth.routes");
const client=require("./config/redis")
// const authUser=require("./middleware/auth.middleware");
const app=express();

app.use(session({
        store: new RedisStore({
            client: client,
        }),

        secret: process.env.SESSION_SECRET,

        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 5, // 5 min
            httpOnly: true,
            secure: false, // true in production with HTTPS
        },
    })
);
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(health);




app.use("/api/v1/auth",authrouter);
app.use(notFound);
app.use(errorHandler);
module.exports=app