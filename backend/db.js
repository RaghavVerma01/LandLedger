const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config("/something.env"); // ✅ Ensure .env is loaded

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ ERROR: MongoDB URI is missing. Check your .env file!");
    process.exit(1);
}

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB Atlas!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectToMongo;
