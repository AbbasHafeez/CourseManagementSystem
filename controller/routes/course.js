const express = require('express');
const Course = require('../models/Course');
const router = express.Router();

router.get('/list', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses", error: err });
  }
});

module.exports = router;
