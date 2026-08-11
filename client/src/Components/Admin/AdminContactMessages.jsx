"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { Trash2, Eye, X, User, Mail, Phone, Calendar, MessageSquare } from "lucide-react";

const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

const S = {
  page: { minHeight: "100vh", padding: "56px 24px 80px" },
  inner: { maxWidth: 1280, margin: "0 auto" },
  h1: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", color: "#fff", margin: "0 0 36px", letterSpacing: "-.02em" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 },
  card: { background: "rgba(15,23,42,.85)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", transition: "border-color .2s, box-shadow .2s" },
  body: { padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 },
  subject: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 17, color: "#E2E8F0", margin: 0, lineHeight: 1.3 },
  preview: { fontSize: 13, color: "#64748B", lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  meta: { display: "flex", flexDirection: "column", gap: 5, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" },
  metaRow: { display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#64748B" },
  metaVal: { color: "#CBD5E1" },
  actions: { display: "flex", gap: 8, marginTop: 4 },
  viewBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: "rgb(var(--accent-rgb) / .1)", border: "1px solid rgb(var(--accent-rgb) / .25)", color: "var(--accent)", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  delBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#FCA5A5", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  empty: { textAlign: "center", color: "#334155", fontSize: 20, paddingTop: 80, fontFamily: "'Space Grotesk'" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#0D1526", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,.6)" },
  modalHeader: { padding: "22px 26px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 },
  modalTitle: { fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 20, color: "#fff", margin: 0 },
  closeBtn: { background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "#94A3B8", borderRadius: 10, padding: 6, cursor: "pointer", display: "flex" },
  modalBody: { overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 },
  sectionLabel: { fontSize: 11, color: "#64748B", fontFamily: "'JetBrains Mono'", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  infoBox: { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "12px 14px" },
  infoLabel: { fontSize: 11, color: "#64748B", fontFamily: "'JetBrains Mono'", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 },
  infoVal: { fontSize: 14, color: "#E2E8F0", fontWeight: 500, margin: 0 },
  msgText: { fontSize: 14, color: "#CBD5E1", lineHeight: 1.75, whiteSpace: "pre-wrap", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: "14px 16px" },
};

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/contact`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setMessages(res.data);
    } catch { toast.error("Failed to load messages"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/contact/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success("Message deleted");
      setMessages(m => m.filter(x => x._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch { toast.error("Failed to delete"); }
  };

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#94A3B8", fontSize: 18, fontFamily: "'Space Grotesk'" }}>Loading...</p>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <h1 style={S.h1}>Contact Messages</h1>

        {messages.length === 0 ? (
          <p style={S.empty}>No contact messages yet.</p>
        ) : (
          <div style={S.grid}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={S.card}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgb(var(--accent-rgb) / .25)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={S.body}>
                  <h3 style={S.subject}>{msg.subject}</h3>
                  {msg.message && <p style={S.preview}>{msg.message}</p>}

                  <div style={S.meta}>
                    <div style={S.metaRow}><User size={13} /><span style={S.metaVal}>{msg.name}</span></div>
                    <div style={S.metaRow}><Mail size={13} /><span style={S.metaVal}>{msg.email}</span></div>
                    {msg.phone && <div style={S.metaRow}><Phone size={13} /><span style={S.metaVal}>{msg.phone}</span></div>}
                    <div style={S.metaRow}><Calendar size={13} /><span>{new Date(msg.createdAt).toLocaleDateString('en-GB')}</span></div>
                  </div>

                  <div style={S.actions}>
                    <button style={S.viewBtn} onClick={() => setSelected(msg)}><Eye size={14} /> View</button>
                    <button style={S.delBtn} onClick={() => handleDelete(msg._id)}><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}>
            <motion.div style={S.modal} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}>

              <div style={S.modalHeader}>
                <h2 style={S.modalTitle}>{selected.subject}</h2>
                <button style={S.closeBtn} onClick={() => setSelected(null)}><X size={18} /></button>
              </div>

              <div style={S.modalBody}>
                <div style={S.infoGrid}>
                  <div style={S.infoBox}>
                    <p style={S.infoLabel}>From</p>
                    <p style={S.infoVal}>{selected.name}</p>
                  </div>
                  <div style={S.infoBox}>
                    <p style={S.infoLabel}>Date</p>
                    <p style={S.infoVal}>{new Date(selected.createdAt).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div style={{ ...S.infoBox, gridColumn: "1 / -1" }}>
                    <p style={S.infoLabel}>Email</p>
                    <p style={S.infoVal}>{selected.email}</p>
                  </div>
                  {selected.phone && (
                    <div style={{ ...S.infoBox, gridColumn: "1 / -1" }}>
                      <p style={S.infoLabel}>Phone</p>
                      <p style={S.infoVal}>{selected.phone}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p style={S.sectionLabel}>Message</p>
                  <p style={S.msgText}>{selected.message}</p>
                </div>

                <button style={{ ...S.delBtn, padding: "13px", borderRadius: 12, fontSize: 14 }}
                  onClick={() => handleDelete(selected._id)}>
                  <Trash2 size={15} /> Delete Message
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
