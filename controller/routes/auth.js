const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { rollNumber } = req.body;
  try {
    // Populate the student's registered courses
    const student = await Student.findOne({ rollNumber }).populate('courses');
    if (!student) {
      return res.status(400).json({ success: false, message: "Invalid Roll Number" });
    }
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
});

module.exports = router;
