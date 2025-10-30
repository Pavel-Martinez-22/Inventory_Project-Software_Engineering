document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;
    const repeatPassword = document.getElementById('repeat-password-input').value;

    if (password !== repeatPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('/api/register', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, repeatPassword }),
        });

        let result;
        try {
            result = await response.json(); // Attempt to parse JSON
        } catch (err) {
            result = { message: await response.text() }; // Fallback to plain text
        }

        if (response.ok) {
            document.getElementById('registerResult').innerHTML = `<p style="color:green;">${result.message}</p>`;
            document.getElementById('registerForm').reset();
        } else {
            document.getElementById('registerResult').innerHTML = `<p style="color:red;">${result.message}</p>`;
        }
    } catch (error) {
        console.error('Error during registration:', error);
        document.getElementById('registerResult').innerHTML = `<p style="color:red;">Failed to register. Please try again later.</p>`;
    }
});