const express = require('express');
const router = express.Router();

const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Student = require('../models/Student');

// 1. Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username, password });
    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }
    return res.json({ success: true, message: "Admin Logged In" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 2. Add Course (Updated to include new fields)
router.post('/course', async (req, res) => {
  const { name, code, seats, department, level, time, days, prerequisites } = req.body;
  try {
    const newCourse = new Course({
      name,
      code,
      seats,
      department,
      level,
      time,
      days,
      prerequisites: []
    });
    await newCourse.save();
    res.json({ success: true, course: newCourse });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding course", error: err });
  }
});

// 3. Update Course using course code (Updated to handle new fields)
router.put('/course/:code', async (req, res) => {
  const { code } = req.params;
  const updateData = req.body;
  try {
    const updatedCourse = await Course.findOneAndUpdate({ code }, updateData, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, course: updatedCourse });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating course", error: err });
  }
});

// 4. Delete Course using course code
router.delete('/course/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const deletedCourse = await Course.findOneAndDelete({ code });
    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting course", error: err });
  }
});

// 5. Set Prerequisites using course code
router.put('/course/:code/prerequisites', async (req, res) => {
  const { code } = req.params;
  const { prerequisites } = req.body; // Array of prerequisite course codes
  try {
    const course = await Course.findOne({ code });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    // Convert prerequisite course codes to their _id values
    const prereqCourses = await Course.find({ code: { $in: prerequisites } });
    course.prerequisites = prereqCourses.map(c => c._id);
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error setting prerequisites", error: err });
  }
});

// 6. Adjust Seats for a Course using course code
router.put('/course/:code/seats', async (req, res) => {
  const { code } = req.params;
  const { seats } = req.body;
  try {
    const updatedCourse = await Course.findOneAndUpdate({ code }, { seats }, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, course: updatedCourse });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating seats", error: err });
  }
});

// 7. View Registrations for a Specific Course using course code
router.get('/registrations/course/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const course = await Course.findOne({ code });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    const students = await Student.find({ courses: course._id });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching course registrations", error: err });
  }
});

// 8. View All Registrations (all students with their enrolled courses)
router.get('/registrations', async (req, res) => {
  try {
    const students = await Student.find().populate('courses');
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching registrations", error: err });
  }
});

// 9. List Courses with Available Seats (seats > 0)
router.get('/courses/available', async (req, res) => {
  try {
    const availableCourses = await Course.find({ seats: { $gt: 0 } });
    res.json({ success: true, courses: availableCourses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching available courses", error: err });
  }
});

// 10. List Students Who Have Not Completed Prerequisites
router.get('/registrations/incomplete', async (req, res) => {
  try {
    const students = await Student.find().populate('courses');
    let incompleteStudents = [];
    for (let student of students) {
      const studentCourseIds = new Set(student.courses.map(c => c._id.toString()));
      let missingPrereq = false;
      for (let course of student.courses) {
        for (let prereqId of course.prerequisites) {
          if (!studentCourseIds.has(prereqId.toString())) {
            missingPrereq = true;
            break;
          }
        }
        if (missingPrereq) break;
      }
      if (missingPrereq) {
        incompleteStudents.push(student);
      }
    }
    res.json({ success: true, students: incompleteStudents });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching incomplete prerequisite registrations", error: err });
  }
});

// NEW: Manage Students

// 11. Add Student
router.post('/student', async (req, res) => {
  const { rollNumber, name } = req.body;
  try {
    const newStudent = new Student({ rollNumber, name, courses: [] });
    await newStudent.save();
    res.json({ success: true, student: newStudent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding student", error: err });
  }
});

// 12. Delete Student using roll number
router.delete('/student/:rollNumber', async (req, res) => {
  const { rollNumber } = req.params;
  try {
    const deletedStudent = await Student.findOneAndDelete({ rollNumber });
    if (!deletedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting student", error: err });
  }
});

// 13. Override Registration: Force-add a course to a student regardless of seat availability
router.post('/student/:rollNumber/override', async (req, res) => {
  const { rollNumber } = req.params;
  const { courseCode } = req.body;
  try {
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    const course = await Course.findOne({ code: courseCode });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    // Add the course to student's courses array if not already registered
    if (!student.courses.includes(course._id)) {
      student.courses.push(course._id);
      await student.save();
    }
    res.json({ success: true, message: "Registration override successful", student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error overriding registration", error: err });
  }
  
  
});

// 11. View All Students
router.get('/students', async (req, res) => {
    try {
      const students = await Student.find();
      res.json({ success: true, students });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching students", error: err });
    }
  });
  

module.exports = router;
