"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, X, Upload, Image } from "lucide-react";

const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

const S = {
  page: { minHeight: "100vh", padding: "56px 24px 80px" },
  inner: { maxWidth: 1280, margin: "0 auto" },
  h1: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", color: "#fff", margin: "0 0 8px", letterSpacing: "-.02em" },
  subtitle: { color: "#64748B", fontSize: 15, margin: "0 0 36px" },
  toolbar: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 36 },
  addBtn: { display: "flex", alignItems: "center", gap: 9, padding: "13px 24px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", border: "none", borderRadius: 14, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, cursor: "pointer", whiteSpace: "nowrap" },
  searchWrap: { position: "relative", flex: "1 1 220px" },
  searchIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "13px 14px 13px 42px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18 },
  card: { background: "rgba(15,23,42,.85)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", transition: "border-color .2s, box-shadow .2s, transform .2s", cursor: "default", position: "relative" },
  imgWrap: { width: "100%", aspectRatio: "4/3", background: "rgb(var(--secondary-rgb) / .07)", overflow: "hidden", flexShrink: 0 },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .5s" },
  imgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  cardName: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, color: "#E2E8F0", margin: 0 },
  cardDesc: { fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  delBtn: { position: "absolute", top: 10, right: 10, background: "rgba(239,68,68,.85)", border: "none", color: "#fff", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0, transition: "opacity .2s" },
  empty: { textAlign: "center", color: "#334155", fontSize: 20, paddingTop: 80, fontFamily: "'Space Grotesk'" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#0D1526", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, width: "100%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,.6)" },
  modalHeader: { padding: "22px 26px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 },
  modalTitle: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 20, color: "#fff", margin: 0 },
  closeBtn: { background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "#94A3B8", borderRadius: 10, padding: 6, cursor: "pointer", display: "flex" },
  modalBody: { overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16 },
  label: { fontSize: 11, color: "#64748B", fontFamily: "'JetBrains Mono'", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6, display: "block" },
  input: { padding: "13px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  textarea: { padding: "13px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit", width: "100%", minHeight: 80, resize: "vertical", boxSizing: "border-box" },
  fileZone: { display: "block", padding: "20px 14px", border: "2px dashed rgb(var(--secondary-rgb) / .4)", borderRadius: 12, color: "var(--secondary)", fontSize: 14, cursor: "pointer", textAlign: "center" },
  btnRow: { display: "flex", gap: 12, paddingTop: 4 },
  submitBtn: { flex: 1, padding: "14px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", border: "none", borderRadius: 12, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  cancelBtn: { flex: 1, padding: "14px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#94A3B8", borderRadius: 12, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, cursor: "pointer" },
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    setFiltered(categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setCategories(res.data);
    } catch { toast.error("Failed to load categories"); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setName(""); setDescription(""); setImageFile(null); setImagePreview(null); setShowModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (description.trim()) fd.append("description", description.trim());
      if (imageFile) fd.append("image", imageFile);
      const res = await axios.post(`${API_BASE_URL}/categories`, fd, {
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
      });
      setCategories(prev => [...prev, res.data]);
      toast.success("Category added");
      resetForm();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add"); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success("Category deleted");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to delete"); }
  };

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <h1 style={S.h1}>Category Management</h1>
        <p style={S.subtitle}>Add, edit and manage your categories with images</p>

        <div style={S.toolbar}>
          <button style={S.addBtn} onClick={() => setShowModal(true)}><Plus size={20} /> Add Category</button>
          <div style={S.searchWrap}>
            <Search style={S.searchIcon} size={17} />
            <input style={S.searchInput} placeholder="Search categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#94A3B8", textAlign: "center", paddingTop: 60 }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={S.empty}>No categories found</p>
        ) : (
          <div style={S.grid}>
            {filtered.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={S.card}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgb(var(--secondary-rgb) / .35)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.4)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.querySelector(".del-btn").style.opacity = "1";
                  const img = e.currentTarget.querySelector(".card-img");
                  if (img) img.style.transform = "scale(1.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.querySelector(".del-btn").style.opacity = "0";
                  const img = e.currentTarget.querySelector(".card-img");
                  if (img) img.style.transform = "";
                }}
              >
                <div style={S.imgWrap}>
                  {cat.image?.url ? (
                    <img className="card-img" src={cat.image.url} alt={cat.name} style={S.img}
                      onError={e => { e.target.src = "/placeholder.jpg"; e.target.onerror = null; }} />
                  ) : (
                    <div style={S.imgPlaceholder}><Image size={36} color="rgb(var(--secondary-rgb) / .3)" /></div>
                  )}
                </div>
                <div style={S.cardBody}>
                  <p style={S.cardName}>{cat.name}</p>
                  {cat.description && <p style={S.cardDesc}>{cat.description}</p>}
                </div>
                <button className="del-btn" style={S.delBtn} onClick={() => handleDelete(cat._id, cat.name)}>
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetForm}>
            <motion.div style={S.modal} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}>

              <div style={S.modalHeader}>
                <h2 style={S.modalTitle}>New Category</h2>
                <button style={S.closeBtn} onClick={resetForm}><X size={18} /></button>
              </div>

              <div style={S.modalBody}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={S.label}>Category name</label>
                    <input style={S.input} placeholder="e.g. Phone Cases" value={name} onChange={e => setName(e.target.value)} required disabled={creating} />
                  </div>
                  <div>
                    <label style={S.label}>Description (optional)</label>
                    <textarea style={S.textarea} placeholder="Category description..." value={description} onChange={e => setDescription(e.target.value)} disabled={creating} />
                  </div>
                  <div>
                    <label style={S.label}>Image (optional)</label>
                    <label style={S.fileZone}>
                      <input type="file" accept="image/*" style={{ display: "none" }} disabled={creating}
                        onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
                      <Upload size={28} style={{ margin: "0 auto 8px", display: "block", color: "var(--secondary)" }} />
                      <span>Click to upload</span>
                      <span style={{ display: "block", fontSize: 12, color: "#64748B", marginTop: 4 }}>Recommended: 800×600px</span>
                    </label>
                    {imagePreview && (
                      <div style={{ position: "relative", marginTop: 10 }}>
                        <img src={imagePreview} alt="Preview" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12 }} />
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                          style={{ position: "absolute", top: 8, right: 8, background: "#EF4444", border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={S.btnRow}>
                    <button type="submit" style={{ ...S.submitBtn, opacity: creating ? 0.7 : 1 }} disabled={creating || !name.trim()}>
                      {creating ? <><span style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} /> Creating...</> : "Create category"}
                    </button>
                    <button type="button" style={S.cancelBtn} onClick={resetForm} disabled={creating}>Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
