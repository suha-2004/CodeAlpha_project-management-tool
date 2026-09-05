import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#F1F5F9",
    fontFamily: "'Inter', sans-serif"
  },

  sidebar: {
    width: "240px",
    background: "#0F172A",
    color: "white",
    padding: "24px",
    display: "flex",
    flexDirection: "column"
  },

  sidebarTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "35px",
    display: "block",
    alignItems: "center",
    gap: "8px",
    color: "white",
    textDecoration: "none"
  },

  sidebarItem: {
    margin: "8px 0",
    cursor: "pointer",
    padding: "10px",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#CBD5E1",
    transition: "0.3s",
    textDecoration: "none",
    display: "block"
  },

  main: {
    flex: 1,
    padding: "35px"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px"
  },

  title: {
    fontSize: "30px",
    fontWeight: "700",
    color: "#0F172A"
  },

  subtitle: {
    color: "#64748B",
    marginTop: "5px",
    fontSize: "14px"
  },

  button: {
    background: "linear-gradient(135deg,#4F46E5,#4338CA)",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "0.3s"
  },

  deleteButton: {
    background: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
    marginTop: "14px",
    transition: "0.3s"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "22px"
  },

  card: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
  },

  cardColor: {
    height: "10px"
  },

  cardBody: {
    padding: "22px"
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  modal: {
    background: "white",
    padding: "32px",
    borderRadius: "18px",
    width: "420px",
    boxShadow: "0 20px 45px rgba(0,0,0,0.18)"
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #CBD5E1",
    borderRadius: "10px",
    marginTop: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none"
  }
};

function Dashboard() {

  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#4F46E5"
  });

  const navigate = useNavigate();

  useEffect(() => {
    getProjects();
  }, []);

  // ================= GET PROJECTS =================
  const getProjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://project-management-tool-1-w98p.onrender.com/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProjects(res.data);

    } catch (err) {

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // ================= CREATE PROJECT =================
  const createProject = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://project-management-tool-1-w98p.onrender.com/api/projects",
        newProject,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProjects([res.data, ...projects]);

      setIsModalOpen(false);

      setNewProject({
        name: "",
        description: "",
        color: "#4F46E5"
      });

    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE PROJECT =================
  const deleteProject = async (projectId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {

      const token = localStorage.getItem("token");

      await axios.delete(
        `https://project-management-tool-1-w98p.onrender.com/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProjects(
        projects.filter((project) => project._id !== projectId)
      );

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>

        <Link to="/" style={styles.sidebarTitle}>
          🧠EaseFlow
        </Link>

        <Link
          to="/"
          style={{
            ...styles.sidebarItem,
            background: "#1E293B",
            color: "white"
          }}
        >
          📊 Dashboard
        </Link>

        <Link
          to="/team"
          style={styles.sidebarItem}
        >
          👥 Team
        </Link>

        <div style={{ marginTop: "auto" }}>

          <div
            style={styles.sidebarItem}

            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            🚪 Logout
          </div>

        </div>

      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>

          <div>
            <h1 style={styles.title}>
              Dashboard
            </h1>

            <p style={styles.subtitle}>
              Welcome back! Manage all your projects here.
            </p>
          </div>

          <button
            style={styles.button}

            onMouseOver={(e) => {
              e.target.style.transform = "scale(1.04)";
            }}

            onMouseOut={(e) => {
              e.target.style.transform = "scale(1)";
            }}

            onClick={() => setIsModalOpen(true)}
          >
            + New Project
          </button>

        </div>

        {/* PROJECTS */}
        {projects.length === 0 ? (

          <div style={{
            textAlign: "center",
            marginTop: "120px",
            color: "#94A3B8"
          }}>
            <h2>No Projects Yet</h2>
            <p>Create your first project 🚀</p>
          </div>

        ) : (

          <div style={styles.grid}>

            {projects.map((project) => (

              <div
                key={project._id}

                style={styles.card}

                onClick={() =>
                  navigate(`/project/${project._id}`)
                }

                onMouseOver={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 35px rgba(0,0,0,0.12)";
                }}

                onMouseOut={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 18px rgba(0,0,0,0.08)";
                }}
              >

                <div
                  style={{
                    ...styles.cardColor,
                    background: project.color || "#4F46E5"
                  }}
                />

                <div style={styles.cardBody}>

                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#0F172A",
                    marginBottom: "10px"
                  }}>
                    {project.name}
                  </h3>

                  <p style={{
                    color: "#64748B",
                    fontSize: "14px",
                    lineHeight: "1.5"
                  }}>
                    {project.description || "No description"}
                  </p>

                  {/* DELETE BUTTON */}
                  <button
                    style={styles.deleteButton}

                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project._id);
                    }}

                    onMouseOver={(e) => {
                      e.target.style.background = "#FECACA";
                    }}

                    onMouseOut={(e) => {
                      e.target.style.background = "#FEE2E2";
                    }}
                  >
                    🗑 Delete Project
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* MODAL */}
      {isModalOpen && (

        <div
          style={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >

          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >

            <h2 style={{
              marginBottom: "24px",
              fontSize: "22px",
              color: "#0F172A"
            }}>
              Create New Project
            </h2>

            <form onSubmit={createProject}>

              <label style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#334155"
              }}>
                Project Name
              </label>

              <input
                style={styles.input}
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    name: e.target.value
                  })
                }
                required
              />

              <label style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#334155",
                marginTop: "16px",
                display: "block"
              }}>
                Description
              </label>

              <input
                style={styles.input}
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    description: e.target.value
                  })
                }
              />

              <label style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#334155",
                marginTop: "16px",
                display: "block"
              }}>
                Color Theme
              </label>

              <input
                type="color"
                value={newProject.color}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    color: e.target.value
                  })
                }
                style={{
                  marginTop: "10px",
                  width: "60px",
                  height: "35px",
                  border: "none",
                  cursor: "pointer"
                }}
              />

              <div style={{
                display: "flex",
                gap: "10px",
                marginTop: "28px",
                justifyContent: "flex-end"
              }}>

                <button
                  type="button"

                  style={{
                    ...styles.button,
                    background: "#E2E8F0",
                    color: "#0F172A"
                  }}

                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.button}
                >
                  Create
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;