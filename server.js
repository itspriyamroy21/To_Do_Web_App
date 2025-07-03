const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require('path');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://itspriyamroy21:itspriyam.roy21@todo-cluster.dzxxbg4.mongodb.net/todo_app?retryWrites=true&w=majority&appName=todo-cluster")
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(err));

const SECRET_KEY = "mysecrettoken";

// User model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});
const User = mongoose.model("User", userSchema);

// Task model
const taskSchema = new mongoose.Schema({
    text: String,
    done: Boolean,
    userId: mongoose.Schema.Types.ObjectId
});
const Task = mongoose.model("Task", taskSchema);

// Auth middleware
function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(header, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

// Routes
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Registration failed" });
    }
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, SECRET_KEY);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
});

app.get("/api/tasks", auth, async (req, res) => {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
});

app.post("/api/tasks", auth, async (req, res) => {
    const task = new Task({ text: req.body.text, done: false, userId: req.userId });
    await task.save();
    res.json(task);
});

app.put("/api/tasks/:id", auth, async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task || task.userId.toString() !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
    }
    task.done = !task.done;
    await task.save();
    res.json(task);
});

app.delete("/api/tasks/:id", auth, async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task || task.userId.toString() !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
    }
    await task.deleteOne();
    res.sendStatus(204);
});

// Serve static frontend
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Catch-all: serve index.html for anything else (Express 5 compatible)
app.use((req, res) => {
  console.log('DEBUG: Serving index from', path.join(publicPath, 'index.html'));
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
