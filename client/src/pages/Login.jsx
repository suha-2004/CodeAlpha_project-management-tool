import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ================= LOGIN =================
  const loginUser = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://project-management-tool-1-w98p.onrender.com/api/auth/login",
        {
          email,
          password
        }
      );

      // SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // GO DASHBOARD
      navigate("/dashboard");

    } catch (err) {
      console.log(err.response?.data || err.message);

      alert(
        err.response?.data || "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* GLOW EFFECTS */}
      <div style={styles.blur1}></div>
      <div style={styles.blur2}></div>

      {/* LOGIN CARD */}
      <div style={styles.card}>

        {/* TOP */}
        <div style={styles.topSection}>

          <div style={styles.logo}>
            🧠EaseFlow
          </div>

          <h1 style={styles.title}>
            Welcome Back 👋
          </h1>

          <p style={styles.subtitle}>
            Login to continue managing your projects
          </p>

        </div>

        {/* FORM */}
        <form onSubmit={loginUser} style={styles.form}>

          {/* EMAIL */}
          <div style={styles.inputGroup}>

            <label style={styles.label}>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* FOOTER */}
        <div style={styles.footerBox}>
          <p style={styles.footer}>
            Don’t have an account?
          </p>

          <Link to="/register" style={styles.link}>
            Create Account
          </Link>
        </div>

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
    padding: "20px",
    fontFamily: "'Segoe UI', sans-serif"
  },

  blur1: {
    position: "absolute",
    width: "350px",
    height: "350px",
    background: "#2563eb",
    borderRadius: "50%",
    filter: "blur(140px)",
    top: "-120px",
    left: "-120px",
    opacity: 0.55
  },

  blur2: {
    position: "absolute",
    width: "320px",
    height: "320px",
    background: "#7c3aed",
    borderRadius: "50%",
    filter: "blur(130px)",
    bottom: "-120px",
    right: "-120px",
    opacity: 0.55
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    background: "rgba(255,255,255,0.97)",
    backdropFilter: "blur(14px)",
    borderRadius: "28px",
    padding: "42px",
    boxSizing: "border-box",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    position: "relative",
    zIndex: 5
  },

  topSection: {
    textAlign: "center",
    marginBottom: "30px"
  },

  logo: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "20px",
    letterSpacing: "0.5px"
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
    fontWeight: "700"
  },

  subtitle: {
    marginTop: "12px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "22px"
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
    fontSize: "14px",
    fontWeight: "600"
  },

  input: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "0.2s"
  },

  button: {
    width: "100%",
    padding: "15px",
    marginTop: "10px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "0.2s"
  },

  footerBox: {
    marginTop: "28px",
    textAlign: "center"
  },

  footer: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "8px"
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "14px"
  }
};

export default Login;