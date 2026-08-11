import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api";

const BRAND_GRADIENTS = [
  ["#F59E0B", "#92400E"],
  ["var(--primary)", "#4C1D95"],
  ["#0EA5E9", "#0369A1"],
  ["#10B981", "#065F46"],
  
  ["#EC4899", "#9D174D"],
  ["var(--accent)", "#0E7490"],
];

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/categories`)
      .then((r) => setCategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 26px 30px" }}>
        <div style={{ display: "flex", gap: 14, height: 330 }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: 24,
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.06)",
                animation: "glowPulse 1.8s infinite",
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 26px 30px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          marginBottom: 30,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12.5, letterSpacing: ".12em", color: "var(--accent)", margin: "0 0 10px" }}>
            // SHOP BY CATEGORY
          </p>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,4vw,46px)", letterSpacing: "-.02em", margin: 0 }}>
            Every category, one place.
          </h2>
        </div>

        <button
          onClick={() => navigate("/products")}
          style={{
            fontFamily: "'Manrope'",
            fontWeight: 600,
            color: "#94A3B8",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            transition: "color .25s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
        >
          View all
        </button>
      </div>

      <div className="nv-brand-row">
        {categories.map((cat, idx) => {
          const [g1, g2] = BRAND_GRADIENTS[idx % BRAND_GRADIENTS.length];
          return (
            <div
              key={cat._id}
              className="nv-brand-card"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
              style={{
                position: "relative",
                borderRadius: 24,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,.08)",
                background: "linear-gradient(165deg,rgba(255,255,255,.05),rgba(255,255,255,.01))",
              }}
            >
              {/* Clipped background layer — contains glows so they don't bleed outside */}
              <div style={{ position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", zIndex: 0 }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 50% 120%,${g1},transparent 70%)`,
                    opacity: 0.55,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg,${g1},${g2})`,
                    filter: "blur(34px)",
                    opacity: 0.6,
                    animation: "blob 12s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Logo — pops above card on hover via CSS */}
              {cat.image?.url && (
                <img
                  src={cat.image.url}
                  alt={cat.name}
                  className="nv-brand-logo"
                />
              )}

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 22,
                }}
              >
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "rgba(255,255,255,.6)" }}>
                  Category
                </span>
                <div>
                  <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 22, margin: "0 0 6px" }}>
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p
                      style={{
                        fontFamily: "'Manrope'",
                        fontSize: 13,
                        color: "rgba(255,255,255,.6)",
                        margin: 0,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
