const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET student details by roll number
router.get('/:rollNumber', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber }).populate('courses');
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err });
  }
});

module.exports = router;
