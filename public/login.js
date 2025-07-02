async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        const res = await fetch('https://to-do-web-app-6uh4.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            alert("Login failed");
            return;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred");
    }
}

async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        const res = await fetch('https://to-do-web-app-6uh4.onrender.com/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            alert("Registration failed");
            return;
        }

        alert("Registered successfully! Now log in.");
    } catch (error) {
        console.error("Error registering:", error);
        alert("An error occurred");
    }
}
