"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const STATUS_COLORS = {
  pending:     "background:rgba(234,179,8,.15);color:#fde047;border:1px solid rgba(234,179,8,.3)",
  confirmed:   "background:rgba(59,130,246,.15);color:#93c5fd;border:1px solid rgba(59,130,246,.3)",
  in_delivery: "background:rgb(var(--secondary-rgb) / .15);color:#c4b5fd;border:1px solid rgb(var(--secondary-rgb) / .3)",
  reached:     "background:rgba(34,197,94,.15);color:#86efac;border:1px solid rgba(34,197,94,.3)",
  canceled:    "background:rgba(239,68,68,.15);color:#fca5a5;border:1px solid rgba(239,68,68,.3)",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_delivery: "In Delivery",
  reached: "Delivered",
  canceled: "Canceled",
};

function getNextStatus(current) {
  if (current === "pending") return "confirmed";
  if (current === "confirmed") return "in_delivery";
  if (current === "in_delivery") return "reached";
  return null;
}

function getNextActionLabel(current) {
  if (current === "pending") return "Confirm";
  if (current === "confirmed") return "Send for Delivery";
  if (current === "in_delivery") return "Mark Delivered";
  return "Done";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    let result = [...orders];
    if (selectedStatus !== "all") result = result.filter(o => o.status === selectedStatus);
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest") result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "price_high") result.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    setFiltered(result);
  }, [orders, selectedStatus, sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o._id === orderId);
    if (order.status === newStatus) return;

    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data.order) {
        setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
        if (selectedOrder?._id === orderId) setSelectedOrder(res.data.order);
      }
      toast.success("Status updated!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Update failed");
      fetchOrders();
    }
  };

  const statusBadge = (status) => {
    const styles = STATUS_COLORS[status] || "";
    const [bg, color, border] = styles.split(";").map(s => s.split(":")[1]);
    return { background: bg, color, border, borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono'", whiteSpace: "nowrap" };
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8", fontSize: 20 }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: "100vh", padding: "56px 16px 60px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(32px,5vw,60px)", color: "#fff", margin: "0 0 8px" }}>
            Orders
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 16, margin: 0 }}>Track and manage all orders in real time</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32, justifyContent: "center" }}>
          {["all", "pending", "confirmed", "in_delivery", "reached", "canceled"].map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              style={{ padding: "8px 18px", borderRadius: 999, border: `1px solid ${selectedStatus === s ? "rgb(var(--secondary-rgb) / .5)" : "rgba(255,255,255,.1)"}`, background: selectedStatus === s ? "rgb(var(--secondary-rgb) / .2)" : "rgba(255,255,255,.04)", color: selectedStatus === s ? "#c4b5fd" : "#94A3B8", fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s", textTransform: "uppercase" }}
            >
              {s === "all" ? "All Orders" : STATUS_LABELS[s]}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: "8px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(15,23,42,.8)", color: "#94A3B8", fontSize: 13, outline: "none", cursor: "pointer" }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price_high">Price: high to low</option>
          </select>
        </div>

        {/* Orders Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "#64748B", fontSize: 24, fontWeight: 300 }}>No orders found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
            {filtered.map(order => {
              const nextStatus = getNextStatus(order.status);
              return (
                <motion.article
                  key={order._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ background: "rgba(15,23,42,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", cursor: "pointer", backdropFilter: "blur(16px)" }}
                  onClick={() => setSelectedOrder(order)}
                  whileHover={{ y: -4 }}
                >
                  {/* Card header */}
                  <div style={{ background: "rgb(var(--secondary-rgb) / .12)", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "20px 20px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#64748B", margin: "0 0 4px" }}>
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 18, color: "#fff", margin: "0 0 4px" }}>
                          {order.customerName}
                        </h3>
                        <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>{order.phone}</p>
                      </div>
                      <span style={statusBadge(order.status)}>{STATUS_LABELS[order.status]}</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "16px 20px", fontSize: 14, color: "#94A3B8", display: "flex", flexDirection: "column", gap: 6 }}>
                    <p><strong style={{ color: "#cbd5e1" }}>Wilaya:</strong> {order.wilaya}</p>
                    {order.address && <p><strong style={{ color: "#cbd5e1" }}>Address:</strong> {order.address}</p>}
                    <p><strong style={{ color: "#cbd5e1" }}>Items:</strong> {order.items.reduce((s, i) => s + i.quantity, 0)} pcs</p>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: "12px 20px 16px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                    {order.status === "canceled" ? (
                      <button disabled style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(239,68,68,.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,.3)", fontWeight: 700, fontSize: 14 }}>Canceled</button>
                    ) : order.status === "reached" ? (
                      <button disabled style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(34,197,94,.2)", color: "#86efac", border: "1px solid rgba(34,197,94,.3)", fontWeight: 700, fontSize: 14 }}>Delivered</button>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <button
                          onClick={e => { e.stopPropagation(); nextStatus && updateStatus(order._id, nextStatus); }}
                          disabled={!nextStatus}
                          style={{ padding: "11px", borderRadius: 12, border: "none", background: nextStatus ? "linear-gradient(135deg,var(--secondary),var(--primary))" : "rgba(255,255,255,.08)", color: nextStatus ? "#fff" : "#64748B", fontWeight: 700, fontSize: 14, cursor: nextStatus ? "pointer" : "not-allowed" }}
                        >
                          {getNextActionLabel(order.status)}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); updateStatus(order._id, "canceled"); }}
                          style={{ padding: "11px", borderRadius: 12, background: "transparent", border: "1px solid rgba(239,68,68,.4)", color: "#fca5a5", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              style={{ background: "rgba(15,23,42,.98)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, maxWidth: 900, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 26, color: "#fff", margin: 0 }}>
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h2>
                  <button onClick={() => setSelectedOrder(null)} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: 8, cursor: "pointer", color: "#94A3B8" }}>
                    <X size={22} />
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24, marginBottom: 28 }}>
                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: 20 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, color: "var(--secondary)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: ".04em" }}>Customer</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#94A3B8" }}>
                      <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Name:</strong> {selectedOrder.customerName}</p>
                      <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Phone:</strong> {selectedOrder.phone}</p>
                      {selectedOrder.customerEmail && <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Email:</strong> {selectedOrder.customerEmail}</p>}
                      <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Wilaya:</strong> {selectedOrder.wilaya}</p>
                      {selectedOrder.address && <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Address:</strong> {selectedOrder.address}</p>}
                      {selectedOrder.desk && <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Desk:</strong> {selectedOrder.desk}</p>}
                      <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Delivery:</strong> {selectedOrder.deliveryType === "home" ? "Home delivery" : "Desk pickup"}</p>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: 20 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, color: "var(--secondary)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: ".04em" }}>Pricing</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#94A3B8" }}>
                      <span style={{ ...statusBadge(selectedOrder.status), display: "inline-block", marginBottom: 8 }}>{STATUS_LABELS[selectedOrder.status]}</span>
                      <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Subtotal:</strong> {selectedOrder.subtotal} DA</p>
                      <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Delivery:</strong> {selectedOrder.deliveryPrice} DA</p>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}><strong>Total:</strong> {selectedOrder.totalPrice} DA</p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 18, color: "#fff", margin: "0 0 16px" }}>Items</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 16, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: 16, alignItems: "center" }}>
                      <img src={item.image || "/placeholder.jpg"} alt={item.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 16, color: "#fff", margin: "0 0 6px" }}>{item.name}</h4>
                        <p style={{ color: "#94A3B8", fontSize: 13, margin: "0 0 4px" }}>Price: {item.price} DA · Qty: {item.quantity}</p>
                        <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 17, color: "var(--secondary)", margin: 0 }}>{item.price * item.quantity} DA</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal actions */}
                {selectedOrder.status !== "canceled" && selectedOrder.status !== "reached" && (
                  <div style={{ display: "flex", gap: 14, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.08)" }}>
                    <button
                      onClick={() => { const next = getNextStatus(selectedOrder.status); if (next) updateStatus(selectedOrder._id, next); }}
                      style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, borderRadius: 14, border: "none", cursor: "pointer" }}
                    >
                      {getNextActionLabel(selectedOrder.status)}
                    </button>
                    <button
                      onClick={() => updateStatus(selectedOrder._id, "canceled")}
                      style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid rgba(239,68,68,.4)", color: "#fca5a5", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, borderRadius: 14, cursor: "pointer" }}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
