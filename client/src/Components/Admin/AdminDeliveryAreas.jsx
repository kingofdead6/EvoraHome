import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Plus, Search, Trash2, Home, Package } from "lucide-react";

export default function AdminDeliveryAreas() {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ wilaya: "", priceHome: 600, priceDesk: 700, desks: [] });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    setFilteredAreas(areas.filter(a => a.wilaya.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [areas, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/delivery-areas`, { headers: { Authorization: `Bearer ${token}` } });
      setAreas(res.data.areas || []);
      setFilteredAreas(res.data.areas || []);
      setSearchTerm("");
    } catch {
      toast.error("Failed to load delivery areas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.wilaya.trim()) return toast.error("Wilaya name is required");
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = {
        wilaya: form.wilaya.trim(),
        priceHome: Number(form.priceHome),
        priceDesk: Number(form.priceDesk),
        desks: form.desks.map(d => ({ name: d.name.trim() })).filter(d => d.name),
      };
      if (editingId) {
        await axios.put(`${API_BASE_URL}/delivery-areas/${editingId}`, { priceHome: payload.priceHome, priceDesk: payload.priceDesk, desks: payload.desks }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/delivery-areas`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(`Added ${form.wilaya}`);
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ wilaya: "", priceHome: 600, priceDesk: 700, desks: [] });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (area) => {
    setEditingId(area.id);
    setForm({ wilaya: area.wilaya, priceHome: area.priceHome, priceDesk: area.priceDesk, desks: area.desks?.map(d => ({ id: Date.now() + Math.random(), name: d.name })) || [] });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this wilaya?")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/delivery-areas/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Deleted successfully");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <motion.section style={{ minHeight: "100vh", padding: "56px 16px 60px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,5vw,56px)", color: "#fff", margin: "0 0 8px" }}>
            Delivery Areas
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 16, margin: 0 }}>Add, edit and manage delivery prices and desks</p>
        </div>

        {/* Add + Search */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, border: "none", borderRadius: 14, cursor: "pointer", flexShrink: 0 }}
          >
            <Plus size={22} /> Add Wilaya
          </button>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={20} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
            <input
              type="text"
              placeholder="Search by wilaya name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", paddingLeft: 48, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: "rgba(15,23,42,.7)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94A3B8", fontSize: 20 }}>Loading...</div>
        ) : filteredAreas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "#64748B", fontSize: 22, fontWeight: 300 }}>No delivery areas found</p>
            <button onClick={() => setShowModal(true)} style={{ marginTop: 20, background: "none", border: "none", color: "var(--secondary)", fontSize: 16, cursor: "pointer", textDecoration: "underline" }}>
              Add the first wilaya
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {filteredAreas.map(area => (
              <motion.div
                key={area.id}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{ background: "rgba(15,23,42,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(16px)", cursor: "pointer" }}
                onClick={() => handleEdit(area)}
              >
                <div style={{ padding: 24, textAlign: "center" }}>
                  <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 22, color: "#fff", margin: "0 0 16px" }}>{area.wilaya}</h3>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", marginBottom: 10, color: "#86efac", fontSize: 16 }}>
                    <Home size={20} />
                    <span style={{ fontWeight: 700 }}>{area.priceHome.toLocaleString()} DA</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", color: "#93c5fd", fontSize: 16 }}>
                    <Package size={20} />
                    <span style={{ fontWeight: 700 }}>{area.priceDesk.toLocaleString()} DA</span>
                  </div>
                  {area.desks?.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)", textAlign: "left" }}>
                      <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 8px", fontFamily: "'JetBrains Mono'" }}>DESKS</p>
                      <ul style={{ listStyle: "disc", paddingLeft: 18, margin: 0, color: "#94A3B8", fontSize: 13 }}>
                        {area.desks.map((d, idx) => <li key={idx}>{d.name}</li>)}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(area.id); }}
                    style={{ width: "100%", padding: "11px", marginTop: 18, background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
          >
            <motion.div
              style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, maxHeight: "85vh", display: "flex", flexDirection: "column", width: "100%", maxWidth: 640, boxShadow: "0 24px 80px rgba(0,0,0,.6)" }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
                <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 24, color: "#fff", margin: 0 }}>
                  {editingId ? "Edit Wilaya" : "Add New Wilaya"}
                </h2>
              </div>
              <div style={{ overflowY: "auto", padding: "24px 28px" }}>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {!editingId && (
                    <input
                      type="text"
                      placeholder="Wilaya name (e.g. Alger, Oran...)"
                      value={form.wilaya}
                      onChange={e => setForm({ ...form, wilaya: e.target.value })}
                      required
                      style={{ padding: "14px 18px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none" }}
                    />
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 8, fontFamily: "'JetBrains Mono'" }}>HOME DELIVERY (DA)</label>
                      <input type="number" value={form.priceHome} onChange={e => setForm({ ...form, priceHome: +e.target.value })} min="0"
                        style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, color: "#fff", fontSize: 18, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 8, fontFamily: "'JetBrains Mono'" }}>DESK DELIVERY (DA)</label>
                      <input type="number" value={form.priceDesk} onChange={e => setForm({ ...form, priceDesk: +e.target.value })} min="0"
                        style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, color: "#fff", fontSize: 18, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 12, fontFamily: "'JetBrains Mono'" }}>DELIVERY DESKS (optional)</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {form.desks.map(desk => (
                        <div key={desk.id} style={{ display: "flex", gap: 10 }}>
                          <input
                            type="text"
                            value={desk.name}
                            onChange={e => setForm({ ...form, desks: form.desks.map(d => d.id === desk.id ? { ...d, name: e.target.value } : d) })}
                            placeholder="Desk name / location"
                            style={{ flex: 1, padding: "12px 16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }}
                          />
                          <button type="button" onClick={() => setForm({ ...form, desks: form.desks.filter(d => d.id !== desk.id) })}
                            style={{ padding: "12px", background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, color: "#fca5a5", cursor: "pointer" }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setForm({ ...form, desks: [...form.desks, { id: Date.now() + Math.random(), name: "" }] })}
                        style={{ padding: "13px", border: "1px dashed rgba(255,255,255,.2)", borderRadius: 12, background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>
                        + Add Desk
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 14, paddingTop: 8 }}>
                    <button type="submit" disabled={loading}
                      style={{ flex: 1, padding: "15px", background: loading ? "#475569" : "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, border: "none", borderRadius: 14, cursor: loading ? "not-allowed" : "pointer" }}>
                      {loading ? "Saving..." : editingId ? "Update" : "Save"}
                    </button>
                    <button type="button" onClick={resetForm}
                      style={{ flex: 1, padding: "15px", background: "transparent", border: "1px solid rgba(255,255,255,.15)", color: "#94A3B8", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, borderRadius: 14, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
