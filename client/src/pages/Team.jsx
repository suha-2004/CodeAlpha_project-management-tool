import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Team() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const userRes = await axios.get(
        "https://project-management-tool-1-w98p.onrender.com/api/auth/me",
        config
      );

      setCurrentUser(userRes.data);

      const usersRes = await axios.get(
        "https://project-management-tool-1-w98p.onrender.com/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTeamMembers(usersRes.data);

    } catch (err) {
      console.log("Error fetching team:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ ONLY NEW FUNCTION ADDED
  const removeMember = async (id) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`https://project-management-tool-1-w98p.onrender.com/api/users/${id}`, config);

      setTeamMembers((prev) => prev.filter((m) => m._id !== id));

    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "#F8FAFC",
      fontFamily: "'Inter', sans-serif"
    },

    sidebar: {
      width: "240px",
      background: "#0F172A",
      color: "white",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0
    },

    sidebarTitle: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "35px",
      color: "white",
      textDecoration: "none",
      display: "block"
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
      padding: "40px"
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px"
    },

    card: {
      background: "white",
      padding: "14px",
      paddingRight: "50px",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      position: "relative"
    },

    closeBtn: {
      position: "absolute",
      top: "10px",
      right: "10px",
      border: "none",
      background: "transparent",
      fontSize: "18px",
      cursor: "pointer",
      color: "red"
    },

    avatar: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "700",
      color: "white",
      flexShrink: 0
    },

    button: {
      background: "#4F46E5",
      color: "white",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px"
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "#64748B" }}>Loading team...</div>;
  }

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <Link to="/" style={styles.sidebarTitle}>🧠EaseFlow</Link>

        <Link to="/" style={styles.sidebarItem}>📊 Dashboard</Link>

        <Link to="/team" style={{ ...styles.sidebarItem, background: "#1E293B", color: "white" }}>
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
            <h1 style={{ fontSize: "30px", fontWeight: "700", color: "#0F172A" }}>
              Team Members
            </h1>
            <p style={{ color: "#64748B", fontSize: "14px" }}>
              People who have access to your projects.
            </p>
          </div>

          <button style={styles.button}>
            + Invite Member
          </button>
        </div>

        {/* CURRENT USER */}
        {currentUser && (
          <div style={{
            ...styles.card,
            borderLeft: "4px solid #4F46E5",
            background: "#FAFAFE",
            marginBottom: "10px"
          }}>
            <div style={{ ...styles.avatar, background: "#4F46E5" }}>
              {currentUser.username?.[0]?.toUpperCase() || "U"}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "14px" }}>
                {currentUser.username}{" "}
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  (You)
                </span>
              </h3>

              <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
                {currentUser.email}
              </p>
            </div>

            <span style={{
              fontSize: "10px",
              background: "#E0E7FF",
              color: "#4F46E5",
              padding: "4px 12px",
              borderRadius: "20px",
              fontWeight: "700"
            }}>
              Admin
            </span>
          </div>
        )}

        {/* TEAM MEMBERS */}
        {teamMembers
          .filter((m) => m._id !== currentUser?._id)
          .map((member) => (
            <div key={member._id} style={styles.card}>

              {/* ✕ BUTTON (ONLY NEW THING) */}
              <button
                style={styles.closeBtn}
                onClick={() => removeMember(member._id)}
              >
                ✕
              </button>

              <div style={{ ...styles.avatar, background: "#6B7280" }}>
                {member.username?.[0]?.toUpperCase() || "U"}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "14px" }}>
                  {member.username}
                </h3>

                <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
                  {member.email}
                </p>
              </div>

              <span style={{
                fontSize: "9px",
                background: "#F1F5F9",
                color: "#475569",
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: "600"
              }}>
                Member
              </span>
            </div>
          ))}

      </div>
    </div>
  );
}

export default Team;