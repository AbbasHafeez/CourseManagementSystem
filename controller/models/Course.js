const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  seats: { type: Number, required: true },
  department: { type: String, default: undefined },
  level: { type: String, default: undefined },
  time: { type: String, default: undefined },
  days: { type: [String], default: [] }, // ✅ Fixed: Array of strings for multiple days
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('Course', CourseSchema);
