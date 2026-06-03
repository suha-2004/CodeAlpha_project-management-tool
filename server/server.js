const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();

/* ================= CREATE HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

/* ================= MAKE IO AVAILABLE ================= */
app.set("io", io);

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

/* ================= ROUTES ================= */
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project.js");
const taskRoutes = require("./routes/task");
const commentRoutes = require("./routes/comment");
const userRoutes = require("./routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use(cors());

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("🚀 API Running Successfully");
});

/* ================= MONGODB ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    server.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err.message);
  });