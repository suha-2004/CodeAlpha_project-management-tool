const express = require("express");
const router = express.Router();

const User = require("../models/User");
const jwt = require("jsonwebtoken");

/* ================= AUTH ================= */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= GET ALL USERS ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE USER (REMOVE FROM TEAM LIST)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndDelete(userId);

    res.json({ message: "User removed successfully" });

  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
});

/* ================= UPDATE USER (NEW) ================= */
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;
    user.email = email;

    await user.save();

    res.json({
      message: "Updated successfully",
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;