document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.querySelector('input[placeholder="Username"]').value;
    const password = document.querySelector('input[placeholder="Password"]').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, pwd: password }),
        });

        const result = await response.json();

        if (response.ok) {
            const token = result.accessToken;
            const roles = Array.isArray(result.roles) ? result.roles : [result.roles]; // Ensure roles is an array

            // Store the token, username, and roles in local storage
            localStorage.setItem("authToken", token);
            localStorage.setItem("username", username);
            localStorage.setItem("roles", JSON.stringify(roles)); // Store roles as a JSON string

            alert('Login successful!');
            window.location.href = './index.html';
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Failed to login. Please try again later.');
    }
});