const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Mongoose Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // stop app if DB fails
});

mongoose.connection.on('error', err => {
    console.error('Mongoose error:', err);
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
Task.find({})
.then(existing => {
    if (existing.length === 0) {
        return Task.insertMany(defaultItems);
    }
})
.then(() => console.log("Default items inserted (if DB was empty)"))
.catch(err => console.error(" Error seeding DB:", err));

// Routes
app.get("/", async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.render("list", { dayej: tasks });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/", async (req, res) => {
    const itemName = req.body.ele1;
    if (itemName.trim()) {
        const newItem = new Task({ name: itemName });
        await newItem.save();
    }
    res.redirect("/");
});

app.post("/delete", async (req, res) => {
    const checkedId = req.body.checkbox1;
    try {
        await Task.findByIdAndDelete(checkedId);
    } catch (err) {
        console.error("Error deleting item:", err);
    }
    res.redirect("/");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
