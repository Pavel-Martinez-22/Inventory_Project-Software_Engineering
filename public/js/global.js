document.addEventListener('DOMContentLoaded', () => {
    const rolesString = localStorage.getItem("roles"); // Retrieve roles as a string
    let roles = [];

    try {
        roles = JSON.parse(rolesString); // Parse roles as JSON
        if (!Array.isArray(roles)) {
            throw new Error('Roles is not an array');
        }
    } catch (error) {
        console.error('Invalid roles format:', rolesString);
        alert('Invalid roles. Please log in again.');
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        localStorage.removeItem("roles");
        window.location.href = './login.html';
        return;
    }

    const currentPage = window.location.pathname;

    console.log('Roles from localStorage:', rolesString);
    console.log('Parsed Roles:', roles);
    console.log('Current Page:', currentPage);

    // Skip authentication check for login and register pages
    if (currentPage === '/login.html' || currentPage === '/register.html') {
        return;
    }

    // Logout functionality
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear the authentication token and username
            localStorage.removeItem("authToken");
            localStorage.removeItem("username");
            localStorage.removeItem("roles");

            // Redirect to the login page
            window.location.href = "./login.html";
        });
    }

    // Display the username in the navbar
    const username = localStorage.getItem("username");
    if (username) {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = `Welcome, ${username}`;
        }
    }

    // Define role-based access for pages
    const pageAccess = {
        '/shipping.html': [1984, 5150], // Vendor and Admin can access
        '/index.html': [1984, 5150],    // Vendor and Admin can access
        '/unauthorized.html': [1984, 5150]    // Vendor and Admin can access
    };

    // Check if the current page has restricted access
    if (roles.includes(2001)) {
        // Role 2001 has global access, skip further checks
        console.log('Role 2001 detected. Access granted to all pages.');
        return;
    }

    if (pageAccess[currentPage]) {
        const hasAccess = roles.some(role => pageAccess[currentPage].includes(role)); // Check roles for the current page
        if (!hasAccess) {
            alert('You do not have access to this page.');
            window.location.href = './unauthorized.html'; // Redirect to an unauthorized page
        }
    } else {
        // Deny access to pages not explicitly listed in pageAccess
        alert('You do not have access to this page.');
        window.location.href = './unauthorized.html';
    }
});