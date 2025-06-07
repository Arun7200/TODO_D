const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// EJS Template Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // Stop app if DB fails
    });

mongoose.connection.on("error", err => {
    console.error("Mongoose error:", err.message);
});

// Schema & Model
const taskSchema = new mongoose.Schema({
    name: String
});

const Task = mongoose.model("Task", taskSchema);

// Default items
const defaultItems = [
    { name: "some video" },
    { name: "DSA" },
    { name: "Reactjs" },
    { name: "Nodejs" },
    { name: "some rest" }
];

// Seed DB if empty
async function seedDB() {
    try {
        const existing = await Task.find({});
        if (existing.length === 0) {
            await Task.insertMany(defaultItems);
            console.log("Default items inserted");
        }
    } catch (err) {
        console.error("Error seeding DB:", err.message);
    }
}

seedDB();

// Routes
app.get("/", async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.render("list", { dayej: tasks });
    } catch (err) {
        console.error("Error fetching tasks:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/", async (req, res) => {
    const itemName = req.body.ele1;
    if (itemName.trim()) {
        try {
            const newItem = new Task({ name: itemName });
            await newItem.save();
        } catch (err) {
            console.error("Error adding task:", err.message);
        }
    }
    res.redirect("/");
});

app.post("/delete", async (req, res) => {
    const checkedId = req.body.checkbox1;
    try {
        await Task.findByIdAndDelete(checkedId);
    } catch (err) {
        console.error("Error deleting task:", err.message);
    }
    res.redirect("/");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
