const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["todo", "inprogress", "done"],
    default: "todo"
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  
  dueDate: {
    type: Date,
    default: null
  },

  priority: {
    type: String,
    enum: ["none", "low", "medium", "high"],
    default: "none"
  },

  coverColor: {
    type: String,
    default: ""
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Task", TaskSchema);