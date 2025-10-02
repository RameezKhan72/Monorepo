// server.js - Main Express Server and API Endpoints

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db'); // Import the DB connection function

// --- 1. Database Connection ---
connectDB(); 

// --- 2. Setup Express App ---
const app = express();
const PORT = 3001; // The backend will run on port 3001

// Middleware
app.use(cors()); // Allows your React app (on a different port) to access this server
app.use(express.json()); // Allows the server to parse JSON bodies

// --- 3. Define MongoDB Schema and Model ---
const attendanceSchema = new mongoose.Schema({
    date: {
        type: String, // Stored as YYYY-MM-DD string
        required: true,
        unique: true // Ensure only one record per day
    },
    // attendanceData stores the status for each student
    // Example: { "s001": "P", "s002": "A", ... }
    attendanceData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

// --- 4. API Routes ---

// GET /api/attendance - Fetch all attendance records
app.get('/api/attendance', async (req, res) => {
    try {
        const records = await Attendance.find().sort({ date: -1 }); // Sort by newest date first
        res.json(records);
    } catch (err) {
        console.error('Error fetching records:', err.message);
        res.status(500).json({ message: 'Server error while fetching attendance.' });
    }
});

// POST /api/attendance - Save a new attendance record
app.post('/api/attendance', async (req, res) => {
    const { currentDate, currentAttendance } = req.body;

    if (!currentDate || !currentAttendance) {
        return res.status(400).json({ message: 'Missing date or attendance data.' });
    }

    try {
        const newRecord = new Attendance({
            date: currentDate,
            attendanceData: currentAttendance 
        });

        await newRecord.save();
        res.status(201).json(newRecord);

    } catch (err) {
        if (err.code === 11000) { // MongoDB duplicate key error (unique index on date)
            return res.status(409).json({ message: 'Attendance for this date has already been recorded.' });
        }
        console.error('Error saving record:', err.message);
        res.status(500).json({ message: 'Server error while saving attendance.' });
    }
});

// --- 5. Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Attendance Backend running on http://localhost:${PORT}`);
});
