const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// mark or update attendance
router.post('/', async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    if (!studentId || !date || !status) return res.status(400).json({ error: 'studentId, date, status required' });

    const att = await Attendance.findOneAndUpdate(
      { student: studentId, date },
      { status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(att);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get attendance for a given date ?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query required as YYYY-MM-DD' });
    const list = await Attendance.find({ date }).populate('student');
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
