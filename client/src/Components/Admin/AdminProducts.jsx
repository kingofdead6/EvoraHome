import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, Edit, X } from "lucide-react";

const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");
const authH = () => ({ Authorization: `Bearer ${getToken()}` });

const S = {
  page: { minHeight: "100vh", padding: "56px 24px 80px" },
  inner: { maxWidth: 1280, margin: "0 auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 },
  h1: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", color: "#fff", margin: 0, letterSpacing: "-.02em" },
  addBtn: { display: "flex", alignItems: "center", gap: 9, padding: "13px 24px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", border: "none", borderRadius: 14, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 20px rgb(var(--primary-rgb) / .35)", whiteSpace: "nowrap" },
  toolbar: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 36 },
  searchWrap: { position: "relative", flex: "1 1 220px" },
  searchIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "13px 14px 13px 42px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  select: { padding: "13px 14px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", minWidth: 180 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18 },
  card: { background: "rgba(15,23,42,.85)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", transition: "transform .2s,border-color .2s,box-shadow .2s" },
  cardImg: { width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", background: "rgb(var(--secondary-rgb) / .07)" },
  cardBody: { padding: "14px 16px 16px" },
  catLabel: { fontSize: 11, color: "#6D28D9", fontFamily: "'JetBrains Mono'", margin: "0 0 4px", fontWeight: 600 },
  cardName: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, color: "#E2E8F0", margin: 0, lineHeight: 1.3 },
  price: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 18, color: "#fff", marginTop: 8, marginBottom: 0 },
  muted: { fontSize: 12, color: "#64748B", marginTop: 2 },
  actionRow: { display: "flex", gap: 8, marginTop: 12 },
  editBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", background: "rgb(var(--secondary-rgb) / .15)", border: "1px solid rgb(var(--secondary-rgb) / .3)", color: "#A78BFA", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  delBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#FCA5A5", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
  modal: { background: "#0D1526", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,.6)" },
  modalHeader: { padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.07)" },
  modalTitle: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 22, color: "#fff", margin: 0 },
  closeBtn: { background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "#94A3B8", borderRadius: 10, padding: 6, cursor: "pointer", display: "flex" },
  formScroll: { overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 },
  input: { padding: "14px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  textarea: { padding: "14px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit", width: "100%", minHeight: 80, resize: "vertical", boxSizing: "border-box" },
  checkRow: { display: "flex", alignItems: "center", gap: 10, color: "#E2E8F0", fontSize: 14, fontFamily: "inherit" },
  fileZone: { display: "block", padding: "18px 14px", border: "2px dashed rgb(var(--secondary-rgb) / .4)", borderRadius: 12, color: "var(--secondary)", fontSize: 14, cursor: "pointer", textAlign: "center" },
  thumbGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 10 },
  thumb: { position: "relative" },
  thumbImg: { width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 10 },
  thumbX: { position: "absolute", top: -5, right: -5, background: "#EF4444", border: "none", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 },
  btnRow: { display: "flex", gap: 12 },
  submitBtn: { flex: 1, padding: "15px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", border: "none", borderRadius: 12, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, cursor: "pointer" },
  cancelBtn: { flex: 1, padding: "15px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#94A3B8", borderRadius: 12, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, cursor: "pointer" },
  sectionLabel: { fontSize: 12, color: "#64748B", fontFamily: "'JetBrains Mono'", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, display: "block" },
  empty: { textAlign: "center", color: "#334155", fontSize: 20, paddingTop: 80, fontFamily: "'Space Grotesk'" },
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "", featured: false, description: "", images: [] });

  useEffect(() => { fetchItems(); fetchCategories(); }, []);

  const fetchCategories = async () => {
    try { const res = await axios.get(`${API_BASE_URL}/categories`, { headers: authH() }); setCategories(res.data); } catch { /* silent */ }
  };

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API_BASE_URL}/products`, { headers: authH() }); setItems(res.data); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setFiltered(items.filter(p => {
      const ms = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const mc = !selectedCat || p.category?._id === selectedCat || p.category === selectedCat;
      return ms && mc;
    }));
  }, [items, searchTerm, selectedCat]);

  const resetForm = () => { setForm({ name: "", category: "", price: "", stock: "", featured: false, description: "", images: [] }); setEditingId(null); setShowModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const fd = new FormData();
    ["name", "category", "price", "stock", "description"].forEach(k => fd.append(k, form[k]));
    fd.append("featured", form.featured);
    form.images.filter(i => i.file).forEach(i => fd.append("images", i.file));
    try {
      if (editingId) { await axios.put(`${API_BASE_URL}/products/${editingId}`, fd, { headers: authH() }); toast.success("Product updated"); }
      else { await axios.post(`${API_BASE_URL}/products`, fd, { headers: authH() }); toast.success("Product created"); }
      resetForm(); fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name, category: item.category?._id || item.category || "", price: item.price, stock: item.stock ?? "", featured: !!item.featured, description: item.description || "", images: item.images.map(i => ({ preview: i.url, url: i.url })) });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await axios.delete(`${API_BASE_URL}/products/${id}`, { headers: authH() }); setItems(p => p.filter(x => x._id !== id)); toast.success("Deleted"); }
    catch { toast.error("Error"); }
  };

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <div style={S.header}>
          <h1 style={S.h1}>Products</h1>
          <button style={S.addBtn} onClick={() => setShowModal(true)}><Plus size={20} /> New</button>
        </div>

        <div style={S.toolbar}>
          <div style={S.searchWrap}>
            <Search style={S.searchIcon} size={17} />
            <input style={S.searchInput} placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select style={S.select} value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {filtered.length === 0 && !loading && <p style={S.empty}>No products found</p>}

        <div style={S.grid}>
          {filtered.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={S.card}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgb(var(--secondary-rgb) / .35)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.boxShadow = ""; }}>
              <img src={item.images?.[0]?.url || "/placeholder.jpg"} alt={item.name} style={S.cardImg} />
              <div style={S.cardBody}>
                <p style={S.catLabel}>{item.category?.name?.toUpperCase() || ""}</p>
                <p style={S.cardName}>{item.name}</p>
                {item.slug && <p style={{ fontSize: 12, color: "#64748B", margin: "3px 0 0" }}>/{item.slug}</p>}
                <p style={S.price}>{item.price?.toLocaleString()} DA</p>
                <p style={S.muted}>Stock: {item.stock ?? 0}{item.featured ? " · Featured" : ""}</p>
                <div style={S.actionRow}>
                  <button style={S.editBtn} onClick={() => handleEdit(item)}><Edit size={13} /> Edit</button>
                  <button style={S.delBtn} onClick={() => handleDelete(item._id)}><Trash2 size={13} /> Delete</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={S.modal} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
              <div style={S.modalHeader}>
                <h2 style={S.modalTitle}>{editingId ? "Edit product" : "New product"}</h2>
                <button style={S.closeBtn} onClick={resetForm}><X size={18} /></button>
              </div>
              <div style={S.formScroll}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <input required placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={S.input} />
                  <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={S.input}>
                    <option value="">Category *</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <div style={S.row2}>
                    <input required type="number" placeholder="Price (DA) *" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={S.input} />
                    <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={S.input} />
                  </div>
                  <label style={S.checkRow}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                    Featured product
                  </label>
                  <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={S.textarea} />
                  <div>
                    <span style={S.sectionLabel}>Images (max 8)</span>
                    <label style={S.fileZone}>
                      <input type="file" multiple accept="image/*" style={{ display: "none" }}
                        onChange={e => { const imgs = Array.from(e.target.files).map(f => ({ file: f, preview: URL.createObjectURL(f) })); setForm(p => ({ ...p, images: [...p.images, ...imgs].slice(0, 8) })); }} />
                      + Add images
                    </label>
                    {form.images.length > 0 && (
                      <div style={S.thumbGrid}>
                        {form.images.map((img, i) => (
                          <div key={i} style={S.thumb}>
                            <img src={img.preview || img.url} style={S.thumbImg} />
                            <button type="button" style={S.thumbX} onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}><X size={11} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={S.btnRow}>
                    <button type="submit" disabled={saving} style={{ ...S.submitBtn, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
                    <button type="button" onClick={resetForm} style={S.cancelBtn}>Cancel</button>
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
