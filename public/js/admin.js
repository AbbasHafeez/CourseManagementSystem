// 1. Add a new course
async function addCourse() {
    const name = prompt("Enter course name:");
    const code = prompt("Enter course code:");
    const seats = prompt("Enter number of seats:");
    const department = prompt("Enter department:");
    const level = prompt("Enter course level:");
    const time = prompt("Enter course time:");
    const days = prompt("Enter course days:");

    if (!name || !code || !seats || !department || !level || !time || !days) {
        alert("All fields are required!");
        return;
    }

    const response = await fetch("http://localhost:7000/api/admin/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            name, code, seats: parseInt(seats), department, level, time, days 
        })
    });

    const data = await response.json();
    if (data.success) {
        alert("Course added successfully!");
    } else {
        alert("Error adding course: " + data.message);
    }
}

  // 2. View all courses
  async function viewCourses() {
    const response = await fetch("http://localhost:7000/api/course/list");
    const courses = await response.json();

    if (!Array.isArray(courses)) {
        alert("Error fetching courses");
        return;
    }

    let coursesList = "All Courses:\n\n";
    courses.forEach(course => {
        coursesList += `Code: ${course.code}\nName: ${course.name}\nSeats: ${course.seats}\n`;
        coursesList += `Department: ${course.department}\nLevel: ${course.level}\nTime: ${course.time}\nDays: ${course.days}\n`;
        coursesList += `Prereqs: ${course.prerequisites?.join(", ") || "None"}\n\n`;
    });
    alert(coursesList);
}

  // 3. Update course (using course code)
  async function updateCourse() {
    const code = prompt("Enter course code to update:");
    if (!code) {
        alert("Course code is required!");
        return;
    }

    const newName = prompt("Enter new course name (or leave blank to skip):");
    const newCode = prompt("Enter new course code (or leave blank to skip):");
    const newSeats = prompt("Enter new seats (or leave blank to skip):");
    const newDepartment = prompt("Enter new department (or leave blank to skip):");
    const newLevel = prompt("Enter new level (or leave blank to skip):");
    const newTime = prompt("Enter new time (or leave blank to skip):");
    const newDays = prompt("Enter new days (or leave blank to skip):");

    let updateData = {};
    if (newName) updateData.name = newName;
    if (newCode) updateData.code = newCode;
    if (newSeats) updateData.seats = parseInt(newSeats);
    if (newDepartment) updateData.department = newDepartment;
    if (newLevel) updateData.level = newLevel;
    if (newTime) updateData.time = newTime;
    if (newDays) updateData.days = newDays;

    const response = await fetch(`http://localhost:7000/api/admin/course/${code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
    });

    const data = await response.json();
    if (data.success) {
        alert("Course updated successfully!");
    } else {
        alert("Error updating course: " + data.message);
    }
}

  // 4. Delete course (using course code)
  async function deleteCourse() {
    const code = prompt("Enter course code to delete:");
    if (!code) {
      alert("Course code is required!");
      return;
    }
  
    const response = await fetch(`http://localhost:7000/api/admin/course/${code}`, {
      method: "DELETE"
    });
    const data = await response.json();
    if (data.success) {
      alert("Course deleted successfully!");
    } else {
      alert("Error deleting course: " + data.message);
    }
  }
  
  // 5. Set prerequisites (using course code and comma-separated prerequisite course codes)
  async function setPrerequisites() {
    const code = prompt("Enter course code to set prerequisites:");
    if (!code) {
      alert("Course code is required!");
      return;
    }
  
    const prereqCodes = prompt("Enter prerequisite course codes (comma-separated):");
    if (!prereqCodes) {
      alert("No prerequisites entered. Operation cancelled.");
      return;
    }
    const prerequisitesArray = prereqCodes.split(",").map(c => c.trim());
  
    const response = await fetch(`http://localhost:7000/api/admin/course/${code}/prerequisites`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prerequisites: prerequisitesArray })
    });
    const data = await response.json();
    if (data.success) {
      alert("Prerequisites set successfully!");
    } else {
      alert("Error setting prerequisites: " + data.message);
    }
  }
  
  // 6. View registrations for a specific course (using course code)
  async function viewCourseRegistrations() {
    const code = prompt("Enter course code to see registrations:");
    if (!code) {
      alert("Course code is required!");
      return;
    }
  
    const response = await fetch(`http://localhost:7000/api/admin/registrations/course/${code}`);
    const data = await response.json();
    if (!data.success) {
      alert("Error fetching course registrations: " + data.message);
      return;
    }
    let output = `Registrations for Course Code: ${code}\n\n`;
    data.students.forEach(student => {
      output += `Student: ${student.name} (${student.rollNumber})\n`;
    });
    alert(output);
  }
  
  // 7. View courses with available seats
  async function viewAvailableCourses() {
    const response = await fetch("http://localhost:7000/api/admin/courses/available");
    const data = await response.json();
    if (data.success) {
        let output = "Courses with Available Seats:\n\n";
        data.courses.forEach(course => {
            output += `Code: ${course.code}, Name: ${course.name}, Seats: ${course.seats}\n`;
            output += `Department: ${course.department}, Level: ${course.level}\nTime: ${course.time}, Days: ${course.days}\n\n`;
        });
        alert(output);
    } else {
        alert("Error fetching available courses: " + data.message);
    }
}

  
  // 8. View students with incomplete prerequisites
  async function viewIncompletePrerequisites() {
    const response = await fetch("http://localhost:7000/api/admin/registrations/incomplete");
    const data = await response.json();
    if (data.success) {
      let output = "Students with Incomplete Prerequisites:\n\n";
      data.students.forEach(student => {
        output += `Student: ${student.name} (${student.rollNumber})\n`;
      });
      alert(output);
    } else {
      alert("Error fetching incomplete prerequisite registrations: " + data.message);
    }
  }
  
  // 9. Admin logout
  function adminLogout() {
    document.getElementById("adminDashboard").style.display = "none";
    document.getElementById("roleSelection").style.display = "block";
    document.getElementById("adminLogin").style.display = "none";
  }

  // 1. Add a new student
async function addStudent() {
    const rollNumber = prompt("Enter student roll number:");
    const name = prompt("Enter student name:");
    if (!rollNumber || !name) {
      alert("Both roll number and name are required!");
      return;
    }
    const response = await fetch("http://localhost:7000/api/admin/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rollNumber, name })
    });
    const data = await response.json();
    if (data.success) {
      alert("Student added successfully!");
    } else {
      alert("Error adding student: " + data.message);
    }
  }
  
  // 2. Delete a student
  async function deleteStudent() {
    const rollNumber = prompt("Enter student roll number to delete:");
    if (!rollNumber) {
      alert("Student roll number is required!");
      return;
    }
    const response = await fetch(`http://localhost:7000/api/admin/student/${rollNumber}`, {
      method: "DELETE"
    });
    const data = await response.json();
    if (data.success) {
      alert("Student deleted successfully!");
    } else {
      alert("Error deleting student: " + data.message);
    }
  }
  
  // 3. Override student registration
  // This forces adding a course to a student even if the course is full.
  async function overrideRegistration() {
    const rollNumber = prompt("Enter student roll number:");
    const courseCode = prompt("Enter course code to override registration:");
    if (!rollNumber || !courseCode) {
      alert("Both student roll number and course code are required!");
      return;
    }
    const response = await fetch(`http://localhost:7000/api/admin/student/${rollNumber}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseCode })
    });
    const data = await response.json();
    if (data.success) {
      alert("Registration override successful!");
    } else {
      alert("Error overriding registration: " + data.message);
    }
  }
  
  // 4. Adjust course seats (update available seats)
  async function adjustSeats() {
    const courseCode = prompt("Enter course code to adjust seats:");
    const newSeats = prompt("Enter new number of seats:");
    if (!courseCode || !newSeats) {
      alert("Both course code and new seat number are required!");
      return;
    }
    const response = await fetch(`http://localhost:7000/api/admin/course/${courseCode}/seats`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seats: parseInt(newSeats) })
    });
    const data = await response.json();
    if (data.success) {
      alert("Seats updated successfully!");
    } else {
      alert("Error updating seats: " + data.message);
    }
  }

  // 10. View All Students (new functionality)
async function viewAllStudents() {
    const response = await fetch("http://localhost:7000/api/admin/students");
    const data = await response.json();
    if (data.success) {
      let output = "All Students:\n\n";
      data.students.forEach(student => {
        output += `Roll Number: ${student.rollNumber}\nName: ${student.name}\n\n`;
      });
      alert(output);
    } else {
      alert("Error fetching students: " + data.message);
    }
  }
  
  