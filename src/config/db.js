const mongoose = require("mongoose");

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("Database Connection Failed:", err.message);
        process.exit(1);
    }
};

module.exports = connectToDB;