const mongoose = require("mongoose");

async function dbCollections() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("Connected to MongoDB....");
    } catch (err) {
        console.log("Connection failed...");
        console.log(err);
    }
}

module.exports = dbCollections;