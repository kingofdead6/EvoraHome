import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api";
import { toast } from "react-toastify";
import { store } from "../store.config.js";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/contact`, form);
      toast.success("Message sent! We'll get back to you shortly.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "14px 18px", borderRadius: 14,
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
    color: "#fff", fontFamily: "'Manrope'", fontSize: 15, outline: "none",
    transition: "border-color .2s", boxSizing: "border-box",
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 2 }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "80px 26px 100px" }}>
        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12.5, letterSpacing: ".12em", color: "var(--accent)", margin: "0 0 14px" }}>
            // CONTACT US
          </p>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(34px,5vw,56px)", letterSpacing: "-.03em", margin: "0 0 16px", lineHeight: 1.1 }}>
            Get in Touch
          </h1>
          <p style={{ fontFamily: "'Manrope'", fontSize: 16, color: "#94A3B8", margin: 0, lineHeight: 1.65 }}>
            Have a question or need help? Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Info Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 44 }}>
          {[
            { icon: "📞", label: "Phone", value: store.contact.phone },
            { icon: "✉️", label: "Email", value: store.contact.email },
            { icon: "📍", label: "Location", value: store.contact.address },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#94A3B8", margin: "0 0 4px", letterSpacing: ".06em" }}>{label.toUpperCase()}</p>
                <p style={{ fontFamily: "'Manrope'", fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 28,
            padding: "40px 36px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <input
              type="text" placeholder="Full Name *" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
            />
            <input
              type="email" placeholder="Email Address *" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <input
              type="tel" placeholder="Phone Number"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
            />
            <input
              type="text" placeholder="Subject *" required
              value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
            />
          </div>
          <textarea
            placeholder="Your message *" rows={6} required
            value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
            style={{ ...inputStyle, resize: "vertical", marginBottom: 24 }}
            onFocus={e => (e.target.style.borderColor = "rgb(var(--secondary-rgb) / .6)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
          />
          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "17px 32px", borderRadius: 16, border: "none",
              background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff",
              fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 17,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 12px 32px -8px rgb(var(--primary-rgb) / .8)",
              transition: "transform .2s,box-shadow .2s",
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 18px 40px -8px rgb(var(--primary-rgb) / .9)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 12px 32px -8px rgb(var(--primary-rgb) / .8)"; }}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </main>
  );
}
