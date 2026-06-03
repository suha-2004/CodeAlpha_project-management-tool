const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Task = require("../models/Task");


// ================= AUTH MIDDLEWARE =================
const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Handle "Bearer token"
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// ================= CREATE TASK =================
router.post("/", auth, async (req, res) => {
  try {
    let { title, projectId, dueDate, status } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: "Title and Project ID required" });
    }

    const task = new Task({
      title: title.trim(),
      project: projectId, // FIXED: Schema uses 'project', not 'projectId'
      status: status || "todo", 
      dueDate: dueDate ? new Date(dueDate) : null
    });

    await task.save();

    // socket emit (optional)
    const io = req.app.get("io");
    if (io) io.emit("taskUpdated");

    return res.status(201).json(task);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// ================= GET TASKS BY PROJECT =================
router.get("/:projectId", auth, async (req, res) => {
  try {
    // FIXED: Query by 'project' to match the schema
    const tasks = await Task.find({
      project: req.params.projectId
    }).sort({ createdAt: -1 });

    return res.json(tasks);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// ================= UPDATE TASK (ALL FIELDS) =================
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, status, dueDate, priority, coverColor } = req.body;
    
    // Build update object dynamically so we only update provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status.toLowerCase();
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (coverColor !== undefined) updateData.coverColor = coverColor;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    const io = req.app.get("io");
    if (io) io.emit("taskUpdated");

    return res.json(task);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// ================= DELETE TASK =================
router.delete("/:id", auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    
    const io = req.app.get("io");
    if (io) io.emit("taskUpdated");

    return res.json({ message: "Task deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;