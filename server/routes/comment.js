const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Comment = require("../models/Comment");

// AUTH middleware - FIXED: Strips "Bearer " before verifying
const auth = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) return res.status(401).json("No token");

  // FIX: Remove "Bearer " if it exists
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json("Invalid token");
  }
};

// ADD COMMENT
router.post("/", auth, async (req, res) => {
  try {
    const { text, taskId } = req.body;

    const comment = new Comment({
      text,
      task: taskId,
      user: req.user.id
    });

    await comment.save();
    res.status(201).json(comment);

  } catch (err) {
    res.status(500).json(err);
  }
});

// GET COMMENTS FOR TASK - ADDED POPULATE FOR USERNAME
router.get("/:taskId", auth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("user", "username") // Fetches the username from the User table
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;