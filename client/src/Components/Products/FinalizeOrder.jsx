import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { CheckCircle, ArrowLeft } from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "16px 20px",
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 14,
  fontSize: 16,
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Space Grotesk', sans-serif",
  transition: "border-color .2s",
};

const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 600,
  color: "#94A3B8",
  fontFamily: "'Space Grotesk', sans-serif",
  letterSpacing: ".04em",
};

export default function FinalizeOrder() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [availableWilayas, setAvailableWilayas] = useState([]);
  const [deliveryPrice, setDeliveryPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    customerEmail: "",
    wilaya: "",
    desk: "",
    address: "",
    deliveryType: "desk",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart || savedCart === "[]") {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }
    setCartItems(JSON.parse(savedCart));
  }, [navigate]);

  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/delivery-areas`);
        setAvailableWilayas(res.data.areas || []);
      } catch (err) {
        toast.error("Failed to load delivery areas");
      }
    };
    fetchWilayas();
  }, []);

  useEffect(() => {
    if (!form.wilaya) {
      setDeliveryPrice(null);
      return;
    }
    const selected = availableWilayas.find(w => w.wilaya === form.wilaya);
    if (selected) {
      setDeliveryPrice(form.deliveryType === "home" ? selected.priceHome : selected.priceDesk);
    }
  }, [form.wilaya, form.deliveryType, availableWilayas]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWithDelivery = deliveryPrice !== null ? subtotal + deliveryPrice : subtotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/orders/create`, {
        ...form,
        deliveryPrice,
        items: cartItems,
      });
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Order placed successfully!");
      setIsSuccess(true);
      setTimeout(() => navigate("/products"), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const desks = availableWilayas.find(w => w.wilaya === form.wilaya)?.desks || [];

  if (isSuccess) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "rgba(15,23,42,.85)", border: "1px solid rgb(var(--secondary-rgb) / .3)", borderRadius: 24, padding: "60px 48px", maxWidth: 420, textAlign: "center", backdropFilter: "blur(16px)" }}>
          <CheckCircle style={{ width: 80, height: 80, color: "var(--secondary)", margin: "0 auto 24px" }} />
          <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 36, color: "#fff", margin: "0 0 12px" }}>
            Order Confirmed!
          </h1>
          <p style={{ fontSize: 16, color: "#94A3B8", margin: 0 }}>We'll contact you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 80, paddingLeft: 20, paddingRight: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <Link
          to="/cart"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#94A3B8", textDecoration: "none", marginBottom: 32, fontSize: 16, fontFamily: "'Space Grotesk'" }}
        >
          <ArrowLeft size={22} />
          Back to Cart
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,5vw,52px)", color: "#fff", margin: "0 0 40px", letterSpacing: "-.02em" }}>
          Finalize Your Order
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, alignItems: "start" }}>

          {/* Form Card */}
          <div style={{ gridColumn: "span 2", background: "rgba(15,23,42,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: 36, backdropFilter: "blur(16px)" }}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 20, color: "#fff", margin: "0 0 28px", letterSpacing: ".01em" }}>
              Your Information
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <div>
                <label style={labelStyle}>FULL NAME *</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  required
                  value={form.customerName}
                  onChange={e => setForm({ ...form, customerName: e.target.value })}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                />
              </div>

              <div>
                <label style={labelStyle}>PHONE NUMBER *</label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                />
              </div>

              <div>
                <label style={labelStyle}>EMAIL ADDRESS *</label>
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  value={form.customerEmail}
                  onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                />
              </div>

              <div>
                <label style={labelStyle}>WILAYA *</label>
                <select
                  required
                  value={form.wilaya}
                  onChange={e => setForm({ ...form, wilaya: e.target.value, desk: "" })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                >
                  <option value="" style={{ background: "#0f172a" }}>Select your wilaya</option>
                  {availableWilayas.map(w => (
                    <option key={w.wilaya} value={w.wilaya} style={{ background: "#0f172a" }}>{w.wilaya}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>DELIVERY TYPE</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { value: "desk", label: "Pickup Point" },
                    { value: "home", label: "Home Delivery" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, deliveryType: opt.value, desk: "" })}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        border: form.deliveryType === opt.value
                          ? "1px solid rgb(var(--secondary-rgb) / .7)"
                          : "1px solid rgba(255,255,255,.1)",
                        background: form.deliveryType === opt.value
                          ? "rgb(var(--secondary-rgb) / .15)"
                          : "rgba(255,255,255,.03)",
                        color: form.deliveryType === opt.value ? "#c4b5fd" : "#94A3B8",
                        fontFamily: "'Space Grotesk'",
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.deliveryType === "desk" && desks.length > 0 && (
                <div>
                  <label style={labelStyle}>PICKUP POINT *</label>
                  <select
                    required
                    value={form.desk}
                    onChange={e => setForm({ ...form, desk: e.target.value })}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                  >
                    <option value="" style={{ background: "#0f172a" }}>Choose a pickup point</option>
                    {desks.map((d, i) => (
                      <option key={i} value={d.name} style={{ background: "#0f172a" }}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.deliveryType === "home" && (
                <div>
                  <label style={labelStyle}>FULL ADDRESS *</label>
                  <textarea
                    placeholder="Street, building, floor..."
                    required
                    rows={4}
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !form.wilaya || (form.deliveryType === "desk" && !form.desk)}
                style={{
                  width: "100%",
                  padding: "18px",
                  background: loading || !form.wilaya || (form.deliveryType === "desk" && !form.desk)
                    ? "rgb(var(--secondary-rgb) / .3)"
                    : "linear-gradient(135deg,var(--secondary),var(--primary))",
                  color: "#fff",
                  fontFamily: "'Space Grotesk'",
                  fontWeight: 700,
                  fontSize: 17,
                  borderRadius: 14,
                  border: "none",
                  cursor: loading || !form.wilaya || (form.deliveryType === "desk" && !form.desk) ? "not-allowed" : "pointer",
                  boxShadow: "0 16px 40px -12px rgb(var(--primary-rgb) / .6)",
                  transition: "all .25s",
                  marginTop: 8,
                }}
              >
                {loading
                  ? "Commande en cours..."
                  : `Confirm Order — ${totalWithDelivery.toLocaleString()} DA`}
              </button>
            </form>
          </div>

          {/* Order Summary Card */}
          <div style={{ background: "rgba(15,23,42,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: 28, backdropFilter: "blur(16px)", position: "sticky", top: 96 }}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 20, color: "#fff", margin: "0 0 24px", letterSpacing: ".01em" }}>
              Order Summary
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {cartItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "16px 0",
                    borderBottom: i < cartItems.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none",
                    alignItems: "center",
                  }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 15, color: "#fff", margin: "0 0 4px", lineHeight: 1.3 }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, color: "var(--secondary)", margin: 0, whiteSpace: "nowrap" }}>
                    {(item.price * item.quantity).toLocaleString()} DA
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#94A3B8" }}>
                <span>Subtotal</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{subtotal.toLocaleString()} DA</span>
              </div>

              {deliveryPrice !== null && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#94A3B8" }}>
                  <span>Delivery ({form.wilaya})</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{deliveryPrice.toLocaleString()} DA</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 20, fontWeight: 700 }}>
                <span style={{ color: "#fff" }}>Total</span>
                <span style={{ color: "var(--secondary)" }}>{totalWithDelivery.toLocaleString()} DA</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
