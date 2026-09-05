import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://project-management-tool-1-w98p.onrender.com/api/auth/register",
        {
          username,
          email,
          password
        }
      );

      alert(res.data.message || "Registration successful");

      navigate("/login");

    } catch (err) {
      console.log(err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div style={styles.page}>

      {/* BACKGROUND */}
      <div style={styles.blur1}></div>
      <div style={styles.blur2}></div>

      {/* CARD */}
      <div style={styles.card}>

        <div style={styles.logo}>
          🧠EaseFlow
        </div>

        <h1 style={styles.title}>
          Create Account
        </h1>

        <p style={styles.subtitle}>
          Register to start managing projects
        </p>

        <form onSubmit={registerUser} style={styles.form}>

          {/* USERNAME */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* EMAIL */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* PASSWORD */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Create Account
          </button>

        </form>

        <p style={styles.footer}>
          Already have an account?
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', sans-serif"
  },

  blur1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "#2563eb",
    borderRadius: "50%",
    filter: "blur(120px)",
    top: "-80px",
    left: "-80px",
    opacity: 0.5
  },

  blur2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "#7c3aed",
    borderRadius: "50%",
    filter: "blur(120px)",
    bottom: "-100px",
    right: "-100px",
    opacity: 0.5
  },

  card: {
    width: "420px",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)",
    padding: "42px",
    borderRadius: "24px",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
    zIndex: 10,
    boxSizing: "border-box"
  },

  logo: {
    fontSize: "30px",
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: "18px"
  },

  title: {
    textAlign: "center",
    margin: 0,
    color: "#111827",
    fontSize: "30px",
    fontWeight: "700"
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: "10px",
    marginBottom: "32px",
    fontSize: "14px"
  },

  form: {
    width: "100%"
  },

  inputGroup: {
    marginBottom: "22px"
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "600",
    fontSize: "14px"
  },

  input: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box"
  },

  button: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px"
  },

  footer: {
    marginTop: "26px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px"
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
    marginLeft: "5px"
  }
};

export default Register;