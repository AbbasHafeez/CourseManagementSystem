const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Student = require('../models/Student');
const Course = require('../models/Course');

// POST /api/registration
// Register a course for a student by rollNumber & courseCode
router.post('/', async (req, res) => {
  const { rollNumber, courseCode } = req.body;
  try {
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    const course = await Course.findOne({ code: courseCode });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    // Check if already registered
    const existing = await Registration.findOne({ student: student._id, course: course._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Course already registered" });
    }
    // Create new registration doc
    const registration = new Registration({ student: student._id, course: course._id });
    await registration.save();
    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error registering course", error: err });
  }
});

// GET /api/registration/:rollNumber
// Fetch all registrations for a given student rollNumber
router.get('/:rollNumber', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    // Populate the course details
    const registrations = await Registration.find({ student: student._id }).populate('course');
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching registrations", error: err });
  }
});

// DELETE /api/registration/:registrationId
// Remove a single registration document by its ID
router.delete('/:registrationId', async (req, res) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.registrationId);
    if (!reg) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    res.json({ success: true, message: "Registration removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing registration", error: err });
  }
});

module.exports = router;
