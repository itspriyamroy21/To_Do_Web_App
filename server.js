const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// ✅ Allow all origins + methods
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Handle preflight OPTIONS requests
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect("mongodb+srv://itspriyamroy21:priyamroy21@todo-cluster.dzxxbg4.mongodb.net/?retryWrites=true&w=majority&appName=todo-cluster")
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(err));

// ✅ Secret key for JWT
const SECRET_KEY = "mysecrettoken";

// ✅ User model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});
const User = mongoose.model("User", userSchema);

// ✅ Task model
const taskSchema = new mongoose.Schema({
    text: String,
    done: Boolean,
    userId: mongoose.Schema.Types.ObjectId
});
const Task = mongoose.model("Task", taskSchema);

// ✅ Register route
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

// ✅ Login route
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // generate token
        const token = jwt.sign({ userId: user._id }, SECRET_KEY);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
});

// ✅ Middleware to verify token
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

// ✅ Get all tasks for logged in user
app.get("/api/tasks", auth, async (req, res) => {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
});

// ✅ Add task
app.post("/api/tasks", auth, async (req, res) => {
    const task = new Task({ text: req.body.text, done: false, userId: req.userId });
    await task.save();
    res.json(task);
});

// ✅ Toggle done
app.put("/api/tasks/:id", auth, async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task || task.userId.toString() !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
    }
    task.done = !task.done;
    await task.save();
    res.json(task);
});

// ✅ Delete task
app.delete("/api/tasks/:id", auth, async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task || task.userId.toString() !== req.userId) {
        return res.status(404).json({ message: "Task not found" });
    }
    await task.deleteOne();
    res.sendStatus(204);
});

const path = require('path');

// Serve static files from public
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all: serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ✅ Start server
app.listen(5001, () => console.log("Server started on http://localhost:5001"));
