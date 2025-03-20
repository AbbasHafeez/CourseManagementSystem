// Role selection functions
function showStudentLogin() {
    document.getElementById("roleSelection").style.display = "none";
    document.getElementById("studentLogin").style.display = "block";
  }
  
  function showAdminLogin() {
    document.getElementById("roleSelection").style.display = "none";
    document.getElementById("adminLogin").style.display = "block";
  }
  
  // Student login: sends roll number to backend endpoint /api/auth/login
  async function studentLogin() {
    const rollNumber = document.getElementById('studentRollNumber').value;
    // Validate login
    const response = await fetch('http://localhost:7000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber })
    });
    const data = await response.json();
    
    if (data.success) {
      // Store roll number for future use
      localStorage.setItem('studentRollNumber', rollNumber);
      
      // Fetch student's registrations
      const regResponse = await fetch(`http://localhost:7000/api/registration/${rollNumber}`);
      const regData = await regResponse.json();
      if (regData.success) {
        localStorage.setItem('registrations', JSON.stringify(regData.registrations));
        renderCalendar(regData.registrations); // show them in the schedule
      } else {
        localStorage.setItem('registrations', JSON.stringify([]));
        renderCalendar([]);
      }
      
      // Show student dashboard
      document.getElementById("studentLogin").style.display = "none";
      document.getElementById("studentDashboard").style.display = "block";
      
      // Also fetch the list of available courses
      fetchAvailableCourses();
    } else {
      alert("Student Login failed!");
    }
  }
  
  
  
  // Student logout: clear dashboard and return to role selection
  function studentLogout() {
    document.getElementById("studentDashboard").style.display = "none";
    document.getElementById("roleSelection").style.display = "block";
  }
  
  // Admin login function
  async function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    const response = await fetch('http://localhost:7000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.success) {
      // Hide login, show admin dashboard
      document.getElementById("adminLogin").style.display = "none";
      document.getElementById("adminDashboard").style.display = "block";
    } else {
      alert("Invalid Admin credentials!");
    }
  }
  