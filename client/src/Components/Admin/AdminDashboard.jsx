import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ADMIN_SECTIONS = [
  { path: "/admin/orders", title: "Manage Orders", description: "View and update order statuses" },
  { path: "/admin/products", title: "Manage Products", description: "Create, edit and delete products" },
  { path: "/admin/contacts", title: "Contact Messages", description: "Manage user contact messages" },
];

const SUPERADMIN_EXTRA = [
  { path: "/admin/users", title: "Manage Users", description: "Create, edit and delete admin accounts" },
  { path: "/admin/categories", title: "Categories", description: "Add and manage product categories" },
  { path: "/admin/delivery-areas", title: "Delivery Areas", description: "Add and update delivery prices by wilaya" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to access the dashboard.");
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.usertype === "admin" || decoded.usertype === "superadmin") {
        setUserType(decoded.usertype);
      } else {
        toast.error("Unauthorized access.");
        navigate("/login");
      }
    } catch {
      toast.error("Invalid token. Please sign in again.");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const sections = userType === "superadmin"
    ? [...ADMIN_SECTIONS, ...SUPERADMIN_EXTRA]
    : ADMIN_SECTIONS;

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8", fontSize: 20 }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      style={{ minHeight: "100vh", padding: "80px 24px 60px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(36px,6vw,72px)", letterSpacing: "-.03em", color: "#fff", margin: 0 }}
          >
            {userType === "superadmin" ? "Super Admin" : "Admin Dashboard"}
          </motion.h1>
        </div>

        {/* Grid */}
        <motion.div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 28 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.path}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link to={section.path} style={{ textDecoration: "none" }}>
                <div style={{ background: "rgba(15,23,42,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "36px 28px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backdropFilter: "blur(16px)", transition: "border-color .25s", boxSizing: "border-box" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgb(var(--secondary-rgb) / .4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"}
                >
                  <div>
                    <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 22, color: "#fff", margin: "0 0 12px" }}>
                      {section.title}
                    </h2>
                    <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
                      {section.description}
                    </p>
                  </div>
                  <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 600, color: "var(--secondary)", letterSpacing: ".04em" }}>
                      MANAGE →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Logout */}
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <button
            onClick={handleLogout}
            style={{ padding: "14px 40px", background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, borderRadius: 14, cursor: "pointer", transition: "all .25s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.25)"; e.currentTarget.style.borderColor = "rgba(239,68,68,.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,.3)"; }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </motion.section>
  );
}
