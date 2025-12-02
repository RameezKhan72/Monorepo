import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mysql from "mysql2";
import cors from "cors";
//import dotenv from "dotenv";

//dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: "",
  database: "studentdb",
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL via XAMPP!");
  }
});

// Endpoint for /juice
app.get("/juice", (req, res) => {
  const query = "SELECT name FROM juices ORDER BY RAND() LIMIT 1";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching juice:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json({ drink: results[0].name });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
