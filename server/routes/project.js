const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const jwt = require("jsonwebtoken");

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

// ================= CREATE PROJECT =================
router.post("/", authMiddleware, async (req, res) => {

  try {

    const { name, description, color } = req.body;

    const newProject = new Project({
      name,
      description,
      color: color || "#4F46E5",
      owner: req.user.id,
      members: [req.user.id]
    });

    await newProject.save();

    // populate members before sending response
    const populatedProject = await Project.findById(newProject._id)
      .populate("members", "username email");

    res.status(201).json(populatedProject);

  } catch (err) {

    res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
});

// ================= GET USER PROJECTS =================
router.get("/", authMiddleware, async (req, res) => {

  try {

    const projects = await Project.find({
      members: req.user.id
    })
      .populate("members", "username email") // 🔥 IMPORTANT FIX
      .sort({ createdAt: -1 });

    res.json(projects);

  } catch (err) {

    res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
});

// ================= GET SINGLE PROJECT =================
router.get("/:id", authMiddleware, async (req, res) => {

  try {

    const project = await Project.findById(req.params.id)
      .populate("members", "username email") // 🔥 IMPORTANT FIX
      .populate("owner", "username email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json(project);

  } catch (err) {

    res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
});

// ================= DELETE PROJECT =================
router.delete("/:id", authMiddleware, async (req, res) => {

  try {

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    await Project.deleteOne({ _id: req.params.id });

    res.json({
      message: "Project deleted successfully"
    });

  } catch (err) {

    res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
});

module.exports = router;