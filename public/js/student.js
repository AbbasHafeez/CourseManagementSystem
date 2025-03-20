// On page load, if the student dashboard is visible, load the schedule and fetch available courses.
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("studentDashboard").style.display === "block") {
        loadStudentSchedule();
        fetchAvailableCourses();
    }
});

// Load student's schedule from backend and render calendar
async function loadStudentSchedule() {
    const rollNumber = localStorage.getItem("studentRollNumber");

    if (!rollNumber) {
        console.error("No student logged in!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:7000/api/registration/${rollNumber}`);
        const data = await response.json();

        if (data.success) {
            localStorage.setItem("schedule", JSON.stringify(data.registrations));
            renderCalendar(data.registrations);
        }
    } catch (error) {
        console.error("Error fetching schedule:", error);
        alert("Failed to load schedule. Please try again.");
    }
}

// Render the schedule dynamically
function renderCalendar(registrations) {
    const calendarDiv = document.getElementById("calendar");
    calendarDiv.innerHTML = "<h3>Your Weekly Schedule</h3>";

    if (!registrations || registrations.length === 0) {
        calendarDiv.innerHTML += "<p>No courses registered yet.</p>";
        return;
    }

    const ul = document.createElement("ul");

    registrations.forEach((reg) => {
        const course = reg.course;
        const li = document.createElement("li");
        li.innerHTML = `
            ${course.name} (${course.code}) - Time: ${course.time || "N/A"} | 
            Days: ${Array.isArray(course.days) ? course.days.join(", ") : "N/A"}
            <button onclick="removeRegistration('${reg._id}')">Remove</button>
        `;

        ul.appendChild(li);
    });

    calendarDiv.appendChild(ul);
}

// Convert time to 24-hour format for accurate comparison
function convertTo24Hour(timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (!match) return null;

    let [_, hours, minutes, period] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes; // Convert to total minutes for easy comparison
}

// Check for schedule conflicts
function hasConflict(newCourse, currentSchedule) {
    return currentSchedule.some((reg) => {
        if (!reg.course.time || !newCourse.time || !reg.course.days || !newCourse.days) return false;

        const existingStart = convertTo24Hour(reg.course.time);
        const newStart = convertTo24Hour(newCourse.time);

        const sameDays = reg.course.days.some((day) => newCourse.days.includes(day));

        return sameDays && existingStart === newStart;
    });
}

// Register a course and check for schedule conflicts before adding
async function addCourseToSchedule(courseCode) {
    const rollNumber = localStorage.getItem("studentRollNumber");

    if (!rollNumber) {
        alert("No student logged in!");
        return;
    }

    // Ensure courses are available
    if (!window.availableCourses || window.availableCourses.length === 0) {
        alert("Courses have not been loaded yet. Please refresh.");
        return;
    }

    // Fetch current schedule from localStorage
    const currentSchedule = JSON.parse(localStorage.getItem("schedule")) || [];
    const newCourse = window.availableCourses.find((course) => course.code === courseCode);

    if (!newCourse) {
        alert("Course not found!");
        return;
    }

    // Check for conflicts
    if (hasConflict(newCourse, currentSchedule)) {
        alert(`Time Conflict: ${newCourse.name} (${newCourse.code}) conflicts with an already registered course.`);
        return;
    }

    try {
        const response = await fetch("http://localhost:7000/api/registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rollNumber, courseCode }),
        });

        const data = await response.json();

        if (data.success) {
            alert("Course registered successfully!");
            loadStudentSchedule(); // Refresh schedule dynamically
        } else {
            alert("Error registering course: " + data.message);
        }
    } catch (error) {
        console.error("Error adding course:", error);
        alert("Failed to register course. Please try again.");
    }
}

// Remove a course from the student's schedule and update UI
async function removeRegistration(registrationId) {
    try {
        const response = await fetch(`http://localhost:7000/api/registration/${registrationId}`, {
            method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
            alert("Course removed successfully!");
            loadStudentSchedule(); // Reload updated schedule
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert("Error removing course: " + error.message);
        console.error(error);
    }
}

// Fetch available courses and update UI
async function fetchAvailableCourses() {
    try {
        const response = await fetch("http://localhost:7000/api/course/list");
        const courses = await response.json();

        window.availableCourses = courses;
        renderCourseList(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        alert("Failed to fetch available courses. Please try again.");
    }
}

// Render the available course list
function renderCourseList(courses) {
    const courseListDiv = document.getElementById("courseList");
    courseListDiv.innerHTML = "";

    courses.forEach((course) => {
        const courseDiv = document.createElement("div");
        courseDiv.className = "course-item";
        courseDiv.innerHTML = `
            <h4>${course.name} (${course.code})</h4>
            <p>Seats Available: ${course.seats}</p>
            <p>Department: ${course.department}</p>
            <p>Level: ${course.level}</p> 
            <p>Time: ${course.time} | Days: ${course.days}</p>
            <button onclick="addCourseToSchedule('${course.code}')">Add Course</button>
        `;
        courseListDiv.appendChild(courseDiv);
    });
}

// Filtering function for course list
function filterCourses() {
    const department = document.getElementById("filterDepartment").value.toLowerCase();
    const level = document.getElementById("filterLevel").value.toLowerCase();
    const time = document.getElementById("filterTime").value.toLowerCase();
    const days = document.getElementById("filterDays").value.toLowerCase();
    const openSeats = document.getElementById("filterOpenSeats").value;

    const filtered = window.availableCourses.filter((course) => {
        let match = true;

        if (department && (!course.department || !course.department.toLowerCase().includes(department))) {
            match = false;
        }
        if (level && (!course.level || !course.level.toLowerCase().includes(level))) {
            match = false;
        }
        if (time && (!course.time || !course.time.toLowerCase().includes(time))) {
            match = false;
        }
        if (days && (!course.days || !course.days.toLowerCase().includes(days))) {
            match = false;
        }
        if (openSeats && course.seats < parseInt(openSeats)) {
            match = false;
        }

        return match;
    });

    renderCourseList(filtered);
}
