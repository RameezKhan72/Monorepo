// db.js - Handles the connection to MongoDB

const mongoose = require('mongoose');

// IMPORTANT: Replace this placeholder with your actual MongoDB connection string.
// Example: 'mongodb+srv://user:<password>@cluster0.abcde.mongodb.net/attendance-app'
const MONGO_URI = 'YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected Successfully.');
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        // Exit process with failure
        process.exit(1); 
    }
};

module.exports = connectDB;
