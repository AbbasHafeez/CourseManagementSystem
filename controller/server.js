const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const registrationRoutes = require('./routes/registration');  // New Registration routes

const app = express();
app.use(express.json());
app.use(cors());

// Hard-coded MongoDB connection string (adjust as needed)
const MONGO_URI = "mongodb://localhost:27017/coursedb";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

app.use('/api/auth', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/registration', registrationRoutes);  // Mount registration routes

const PORT = 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
