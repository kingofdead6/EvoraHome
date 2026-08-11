import { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email format.";
    if (!password) e.password = "Please enter your password.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        const { token, usertype } = response.data;

        if (remember) {
          localStorage.setItem("token", token);
        } else {
          sessionStorage.setItem("token", token);
        }

        window.dispatchEvent(new Event("authChanged"));
        setErrors({});
        toast.success("Login successful!");

        if (usertype === "admin" || usertype === "superadmin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } catch (error) {
        const message = error.response?.data?.message || "Login failed.";
        setErrors({ form: message });
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 mt-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl font-light tracking-wider"
            style={{ color: "#fff" }}
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-lg font-light"
            style={{ color: "#94A3B8" }}
          >
            Sign in to access the admin panel
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ background: "rgba(15,23,42,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: "40px", backdropFilter: "blur(16px)" }}
        >
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 24, padding: "16px 20px", background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5", borderRadius: 12, textAlign: "center", fontSize: 14 }}
            >
              {errors.form}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 10, fontFamily: "'JetBrains Mono'" }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", insetBlock: 0, left: 16, display: "flex", alignItems: "center", color: "#64748B", pointerEvents: "none" }}>
                  <FaUser />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, borderRadius: 12, border: `1px solid ${errors.email ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)"}`, background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p style={{ marginTop: 8, fontSize: 13, color: "#fca5a5" }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 10, fontFamily: "'JetBrains Mono'" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", insetBlock: 0, left: 16, display: "flex", alignItems: "center", color: "#64748B", pointerEvents: "none" }}>
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", paddingLeft: 44, paddingRight: 48, paddingTop: 14, paddingBottom: 14, borderRadius: 12, border: `1px solid ${errors.password ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)"}`, background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", insetBlock: 0, right: 16, display: "flex", alignItems: "center", color: "#64748B", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p style={{ marginTop: 8, fontSize: 13, color: "#fca5a5" }}>{errors.password}</p>}
            </div>

            {/* Remember me */}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#94A3B8" }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: "var(--secondary)" }} />
              Stay signed in
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: "100%", padding: "16px", background: loading ? "#475569" : "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontSize: 17, fontWeight: 700, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk'", boxShadow: loading ? "none" : "0 20px 46px -14px rgb(var(--primary-rgb) / .9)" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
