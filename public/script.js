// script.js

let addSound = new Audio("add.mp3");
let deleteSound = new Audio("delete.mp3");
let tasks = [];

// ✅ Get token from localStorage
const token = localStorage.getItem("token");

// ✅ Redirect to login if not logged in
if (!token) {
    window.location.href = "login.html";
}

// Load tasks on page load
window.onload = function() {
    fetchTasks();
};

// Fetch all tasks from backend
async function fetchTasks() {
    const res = await fetch('http://localhost:5001/api/tasks', {
        headers: { 'Authorization': token }
    });
    tasks = await res.json();
    renderTasks();
}

// Add new task
async function addTask() {
    let input = document.getElementById("taskInput");
    let taskText = input.value.trim();
    if (taskText === "") return;

    addSound.play();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

    const res = await fetch('http://localhost:5001/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ text: taskText })
    });
    const newTask = await res.json();
    tasks.push(newTask);
    renderTasks();
    input.value = "";
}

// Toggle done
async function toggleTask(id) {
    await fetch(`http://localhost:5001/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': token }
    });
    const task = tasks.find(t => t._id === id);
    task.done = !task.done;
    renderTasks();
}

// Delete task
async function deleteTask(id) {
    deleteSound.play();
    await fetch(`http://localhost:5001/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    tasks = tasks.filter(t => t._id !== id);
    renderTasks();
}

// Render tasks
function renderTasks() {
    let list = document.getElementById("taskList");
    list.innerHTML = ""; // clear list

    tasks.forEach((task) => {
        let li = document.createElement("li");
        li.textContent = task.text;

        if (task.done) {
            li.classList.add("done");
        }

        // Toggle done on click
        li.addEventListener("click", function() {
            toggleTask(task._id);
        });

        // Delete button
        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            deleteTask(task._id);
        });

        li.appendChild(deleteBtn);
        list.appendChild(li);
    });

    updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
    let doneTasks = tasks.filter(task => task.done).length;
    let percent = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;
    document.getElementById("progress-bar").style.width = percent + "%";
}

// Parallax scrolling effect
window.addEventListener("scroll", function() {
    let scrolled = window.pageYOffset;
    document.body.style.backgroundPositionY = -(scrolled * 0.3) + "px";
});

// Optional: logout button
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
