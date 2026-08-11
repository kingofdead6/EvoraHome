// src/pages/admin/AdminUsers.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Search, Edit, Trash2, Shield, ShieldCheck, Key, X } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", usertype: "admin" });
  const [editForm, setEditForm] = useState({ name: "", email: "", usertype: "admin" });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.filter(u => u.usertype === "admin" || u.usertype === "superadmin"));
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;
    if (searchTerm) filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterRole) filtered = filtered.filter(u => u.usertype === filterRole);
    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (createForm.password !== passwordForm.confirmPassword) return toast.error("Passwords do not match");
    if (createForm.password.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/auth/register`, createForm, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Admin created successfully");
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", usertype: "admin" });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/auth/users/${selectedUser._id}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Admin updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error("Passwords do not match");
    if (passwordForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/auth/users/${selectedUser._id}/password`, { password: passwordForm.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this admin?")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/auth/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Admin deleted");
      fetchUsers();
    } catch {
      toast.error("Cannot delete superadmin");
    }
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ minHeight: "100vh", padding: "56px 16px 60px" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,5vw,56px)", color: "#fff", margin: "0 0 8px" }}>
              Manage Admins
            </h1>
            <p style={{ color: "#94A3B8", fontSize: 16, margin: 0 }}>Create, edit and manage admin & superadmin accounts</p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 36 }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 22px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, border: "none", borderRadius: 14, cursor: "pointer" }}
            >
              <Plus size={20} /> Create Admin
            </button>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13, background: "rgba(15,23,42,.7)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              style={{ padding: "13px 18px", background: "rgba(15,23,42,.7)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, color: "#94A3B8", fontSize: 14, outline: "none", cursor: "pointer" }}
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#94A3B8", fontSize: 20 }}>Loading admins...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#64748B", fontSize: 22, fontWeight: 300 }}>No admins found</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
              {filteredUsers.map(user => (
                <motion.div
                  key={user._id}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -6 }}
                  style={{ background: "rgba(15,23,42,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(16px)" }}
                >
                  <div style={{ padding: 24, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                      {user.usertype === "superadmin"
                        ? <ShieldCheck size={52} style={{ color: "#a78bfa" }} />
                        : <Shield size={52} style={{ color: "#60a5fa" }} />}
                    </div>
                    <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 18, color: "#fff", margin: "0 0 6px" }}>{user.name}</h3>
                    <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 14px" }}>{user.email}</p>
                    <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono'", background: user.usertype === "superadmin" ? "rgb(var(--secondary-rgb) / .2)" : "rgba(59,130,246,.2)", color: user.usertype === "superadmin" ? "#c4b5fd" : "#93c5fd", border: `1px solid ${user.usertype === "superadmin" ? "rgb(var(--secondary-rgb) / .4)" : "rgba(59,130,246,.4)"}` }}>
                      {user.usertype === "superadmin" ? "SUPERADMIN" : "ADMIN"}
                    </span>

                    <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                      <button
                        onClick={() => { setSelectedUser(user); setEditForm({ name: user.name, email: user.email, usertype: user.usertype }); setShowEditModal(true); }}
                        style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600 }}
                      >
                        <Edit size={15} /> Edit
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                        style={{ flex: 1, padding: "10px", background: "rgba(251,146,60,.1)", border: "1px solid rgba(251,146,60,.25)", borderRadius: 12, color: "#fdba74", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600 }}
                      >
                        <Key size={15} /> Password
                      </button>
                    </div>

                    {user.usertype !== "superadmin" && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        style={{ width: "100%", padding: "10px", marginTop: 10, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 12, color: "#fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600 }}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showCreateModal && (
            <Modal onClose={() => setShowCreateModal(false)} title="Create Admin">
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <FieldInput label="Full Name" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} required />
                <FieldInput label="Email" type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required />
                <FieldInput label="Password" type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required minLength={6} />
                <FieldInput label="Confirm Password" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                <FieldSelect label="Role" value={createForm.usertype} onChange={e => setCreateForm({ ...createForm, usertype: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </FieldSelect>
                <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                  <button type="submit" style={btnPrimary}>Create</button>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={btnSecondary}>Cancel</button>
                </div>
              </form>
            </Modal>
          )}

          {showEditModal && selectedUser && (
            <Modal onClose={() => setShowEditModal(false)} title="Edit Admin">
              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <FieldInput label="Full Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                <FieldInput label="Email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                <FieldSelect label="Role" value={editForm.usertype} onChange={e => setEditForm({ ...editForm, usertype: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </FieldSelect>
                <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                  <button type="submit" style={btnPrimary}>Update</button>
                  <button type="button" onClick={() => setShowEditModal(false)} style={btnSecondary}>Cancel</button>
                </div>
              </form>
            </Modal>
          )}

          {showPasswordModal && selectedUser && (
            <Modal onClose={() => setShowPasswordModal(false)} title="Change Password">
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <FieldInput label="New Password" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
                <FieldInput label="Confirm Password" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                  <button type="submit" style={{ ...btnPrimary, background: "linear-gradient(135deg,#f97316,#ea580c)" }}>Change</button>
                  <button type="button" onClick={() => setShowPasswordModal(false)} style={btnSecondary}>Cancel</button>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>
      </motion.section>
    </>
  );
}

const btnPrimary = { flex: 1, padding: "14px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, border: "none", borderRadius: 14, cursor: "pointer" };
const btnSecondary = { flex: 1, padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,.15)", color: "#94A3B8", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, borderRadius: 14, cursor: "pointer" };

function Modal({ children, title, onClose }) {
  return (
    <motion.div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, width: "100%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,.6)" }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "22px 26px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 22, color: "#fff", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 6, cursor: "pointer", color: "#94A3B8", display: "flex" }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "22px 26px" }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function FieldInput({ label, ...props }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "#94A3B8", marginBottom: 8, fontFamily: "'JetBrains Mono'", letterSpacing: ".04em" }}>{label.toUpperCase()}</label>
      <input style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} {...props} />
    </div>
  );
}

function FieldSelect({ label, children, ...props }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "#94A3B8", marginBottom: 8, fontFamily: "'JetBrains Mono'", letterSpacing: ".04em" }}>{label.toUpperCase()}</label>
      <select style={{ width: "100%", padding: "13px 16px", background: "rgba(15,23,42,.9)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} {...props}>
        {children}
      </select>
    </div>
  );
}
