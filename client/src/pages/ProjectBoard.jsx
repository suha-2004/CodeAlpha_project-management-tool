import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "#F59E0B" },
  { id: "inprogress", title: "In Progress", color: "#3B82F6" },
  { id: "done", title: "Done", color: "#10B981" }
];

const COVER_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280", "#FFFFFF"];
const PRIORITIES = [
  { value: "high", label: "High", color: "#EF4444" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "low", label: "Low", color: "#10B981" },
  { value: "none", label: "None", color: "#94A3B8" }
];

function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addingInColumn, setAddingInColumn] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`, config),
        axios.get(`http://localhost:5000/api/tasks/${id}`, config)
      ]);
      setProject(projectRes.data);
      const formattedTasks = (tasksRes.data || []).map(t => ({ ...t, status: (t.status || "todo").toLowerCase() }));
      setTasks(formattedTasks);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      console.log(err);
    } finally { setLoading(false); }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const updatedTasks = tasks.map((t) => t._id === draggableId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    try {
      await axios.put(`http://localhost:5000/api/tasks/${draggableId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { setTasks(tasks); }
  };

  const handleAddTask = async (columnId) => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await axios.post("http://localhost:5000/api/tasks",
        { title: newTaskTitle, projectId: id, status: columnId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, res.data]);
      setNewTaskTitle("");
      setAddingInColumn(null);
    } catch (err) { console.log(err); }
  };

  const updateTask = async (taskId, updateData) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, updateData, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
      setSelectedTask(res.data);
    } catch (err) { console.log(err); }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setSelectedTask(null);
    } catch (err) { console.log(err); }
  };

  const openTaskModal = async (task) => {
    setSelectedTask(task);
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${task._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setComments(res.data || []);
    } catch (err) { console.log(err); }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post("http://localhost:5000/api/comments",
        { text: commentText, taskId: selectedTask._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText("");
      openTaskModal(selectedTask);
    } catch (err) { console.log(err); }
  };

  if (loading) return <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>Loading...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F1F5F9" }}>

      {/* SIDEBAR */}
      <div style={{ width: "240px", background: "#0F172A", color: "white", padding: "24px", flexShrink: 0 }}>
        <Link to="/" style={{ textDecoration: "none" }}><h2 style={{ color: "white", cursor: "pointer" }}>🧠EaseFlow</h2></Link>
        <div style={{ marginTop: "32px" }}>
          {/* FIXED BACK BUTTON */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <button style={{ background: "#334155", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginBottom: "16px", width: "100%" }}>
              ← Back to Dashboard
            </button>
          </Link>
          <p style={{ color: "#94A3B8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Current Project</p>
          <h3 style={{ marginTop: "8px", fontSize: "16px" }}>{project?.name}</h3>
        </div>
      </div>

      {/* BOARD */}
      <div style={{ flex: 1, padding: "24px", overflowX: "auto" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "flex", gap: "20px", minHeight: "calc(100vh - 48px)" }}>
            {COLUMNS.map((column) => (
              <Droppable droppableId={column.id} key={column.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ width: "300px", background: snapshot.isDraggingOver ? "#E2E8F0" : "#FFFFFF", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", border: "1px solid #E2E8F0", transition: "background 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: column.color }}></div>
                      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>{column.title}</h3>
                      <span style={{ marginLeft: "auto", background: "#F1F5F9", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", color: "#64748B" }}>{tasks.filter(t => t.status === column.id).length}</span>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto" }}>
                      {tasks.filter((t) => t.status === column.id).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openTaskModal(task)}
                              style={{
                                padding: "0",
                                marginBottom: "10px",
                                background: snapshot.isDragging ? "#EFF6FF" : "white",
                                borderRadius: "8px",
                                boxShadow: snapshot.isDragging
                                  ? "0 12px 28px rgba(0,0,0,0.2)"
                                  : "0 2px 6px rgba(0,0,0,0.06)",
                                cursor: "pointer",
                                border: "1px solid #E2E8F0",
                                transition: snapshot.isDragging
                                  ? "none"
                                  : "all 0.25s ease",
                                opacity: snapshot.isDragging ? 0.95 : 1,

                                ...provided.draggableProps.style
                              }}
                            >
                              {task.coverColor && task.coverColor !== "#FFFFFF" && (
                                <div
                                  style={{
                                    height: "40px",
                                    background: task.coverColor,
                                    borderRadius: "8px 8px 0 0"
                                  }}
                                ></div>
                              )}

                              <div style={{ padding: "12px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "6px",
                                    marginBottom: "8px",
                                    flexWrap: "wrap"
                                  }}
                                >
                                  {task.priority && task.priority !== "none" && (
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        background:
                                          PRIORITIES.find((p) => p.value === task.priority)?.color ||
                                          "#94A3B8",
                                        color: "white",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontWeight: "700"
                                      }}
                                    >
                                      {task.priority.toUpperCase()}
                                    </span>
                                  )}

                                  {task.dueDate && (
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        background: "#FEF3C7",
                                        color: "#D97706",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontWeight: "500"
                                      }}
                                    >
                                      📅 {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#1E293B"
                                  }}
                                >
                                  {task.title}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

                    {addingInColumn === column.id ? (
                      <div style={{ marginTop: "8px" }}>
                        <textarea placeholder="Enter a title for this card..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} autoFocus style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", resize: "none", marginBottom: "8px", boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleAddTask(column.id)} style={{ background: "#4F46E5", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>Add Card</button>
                          <button onClick={() => { setAddingInColumn(null); setNewTaskTitle(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingInColumn(column.id)} style={{ width: "100%", background: "none", border: "none", padding: "8px", color: "#64748B", cursor: "pointer", borderRadius: "6px", textAlign: "left", fontSize: "13px" }}>+ Add card</button>
                    )}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* TASK MODAL */}
      {selectedTask && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "flex-start", zIndex: 1000, paddingTop: "40px" }} onClick={() => setSelectedTask(null)}>
          <div style={{ background: "#F1F5F9", width: "750px", maxHeight: "85vh", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>

            {selectedTask.coverColor && selectedTask.coverColor !== "#FFFFFF" && (
              <div style={{ height: "80px", background: selectedTask.coverColor, position: "relative" }}>
                <button onClick={() => updateTask(selectedTask._id, { coverColor: "" })} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.4)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", padding: "4px 8px" }}>Remove Cover</button>
              </div>
            )}

            <div style={{ background: "white", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
              <input value={selectedTask.title} onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })} onBlur={() => updateTask(selectedTask._id, { title: selectedTask.title })} style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A", width: "100%", border: "none", outline: "none" }} />
            </div>

            <div style={{ display: "flex", flex: 1, overflowY: "auto" }}>
              <div style={{ flex: 1, padding: "24px", background: "white", borderRight: "1px solid #E2E8F0" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>Description</h4>
                <textarea value={selectedTask.description || ""} onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })} onBlur={() => updateTask(selectedTask._id, { description: selectedTask.description })} placeholder="Add a more detailed description..." style={{ width: "100%", minHeight: "100px", padding: "12px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "13px", color: "#334155", boxSizing: "border-box", resize: "vertical", marginBottom: "24px" }} />

                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "12px" }}>Activity</h4>
                {comments.map((c) => (
                  <div key={c._id} style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#64748B", flexShrink: 0 }}>
                      {c.user?.username ? c.user.username[0].toUpperCase() : "U"}
                    </div>
                    <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: "0 8px 8px 8px", flex: 1, border: "1px solid #E2E8F0" }}>
                      <p style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px", fontWeight: "600" }}>{c.user?.username || "Unknown User"}</p>
                      <p style={{ fontSize: "13px", color: "#334155" }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ width: "220px", padding: "24px", background: "#F8FAFC", flexShrink: 0 }}>
                <h5 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#94A3B8", marginBottom: "12px" }}>Actions</h5>

                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>Status</label>
                <select value={selectedTask.status} onChange={(e) => updateTask(selectedTask._id, { status: e.target.value })} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #E2E8F0", marginBottom: "16px", fontSize: "13px" }}>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>Due Date</label>
                <input type="date" value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ""} onChange={(e) => updateTask(selectedTask._id, { dueDate: e.target.value })} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #E2E8F0", marginBottom: "16px", fontSize: "13px" }} />

                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>Priority</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                  {PRIORITIES.map(p => (
                    <button key={p.value} onClick={() => updateTask(selectedTask._id, { priority: p.value })} style={{ background: selectedTask.priority === p.value ? p.color : "#E2E8F0", color: selectedTask.priority === p.value ? "white" : "#334155", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}>
                      {p.label}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>Cover Color</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                  {COVER_COLORS.map(c => (
                    <div key={c} onClick={() => updateTask(selectedTask._id, { coverColor: c })} style={{ width: "24px", height: "24px", background: c, borderRadius: "4px", cursor: "pointer", border: selectedTask.coverColor === c ? "2px solid #0F172A" : "1px solid #CBD5E1" }}></div>
                  ))}
                </div>

                <button onClick={() => deleteTask(selectedTask._id)} style={{ width: "100%", background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Delete Task</button>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "10px", background: "white" }}>
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", outline: "none" }} />
              <button onClick={addComment} style={{ background: "#4F46E5", color: "white", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectBoard;