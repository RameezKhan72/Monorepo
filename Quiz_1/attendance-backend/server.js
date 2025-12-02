const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// ✅ MongoDB connection
mongoose.connect("mongodb+srv://rameezkhan72:rameezkhan72457@rameezkhan.f2aif6l.mongodb.net/?retryWrites=true&w=majority&appName=rameezkhan")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// ✅ Simple route to test the server
app.get("/", (req, res) => {
  res.send("Student Attendance API is running ✅");
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
