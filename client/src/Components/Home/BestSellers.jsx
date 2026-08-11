import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api";

const GRADIENTS = [
  ["var(--secondary)","var(--primary)"],
  ["var(--accent)","#0891B2"],
  ["#F59E0B","#D97706"],
  ["#EC4899","#BE185D"],
  ["#10B981","#059669"],
  ["#6366F1","#4338CA"],
];

function TiltCard({ product, index, onClick }) {
  const cardRef = useRef(null);
  const [g1, g2] = GRADIENTS[index % GRADIENTS.length];

  const onMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.setProperty("--mx", `${mx}%`);
    card.style.setProperty("--my", `${my}%`);
  };

  const onMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        position: "relative", borderRadius: 22, overflow: "hidden", cursor: "pointer",
        border: "1px solid rgba(255,255,255,.08)",
        background: "linear-gradient(170deg,rgba(255,255,255,.055),rgba(255,255,255,.015))",
        backdropFilter: "blur(8px)",
        transition: "box-shadow .3s",
        transformStyle: "preserve-3d",
        animation: `fadeUp .6s both`,
        animationDelay: `${index * 0.07}s`,
        "--mx": "50%", "--my": "50%",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 34px 60px -22px rgb(var(--primary-rgb) / .6)"}
    >
      {/* Radial spotlight */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(220px circle at var(--mx) var(--my),rgb(var(--secondary-rgb) / .2),transparent 60%)", pointerEvents: "none", zIndex: 3 }} />

      {/* Phone visual */}
      <div style={{ position: "relative", height: 248, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 30%,rgb(var(--secondary-rgb) / .18),transparent 60%)", overflow: "hidden" }}>
        {product.badge && (
          <span style={{ position: "absolute", top: 13, left: 13, zIndex: 4, fontFamily: "'JetBrains Mono'", fontSize: 10.5, fontWeight: 600, padding: "5px 10px", borderRadius: 8, background: "rgb(var(--accent-rgb) / .15)", border: "1px solid rgb(var(--accent-rgb) / .4)", color: "var(--accent)" }}>
            {product.badge}
          </span>
        )}
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} style={{ width: 128, height: "auto", maxHeight: 264, objectFit: "contain", transform: "translateZ(40px)", filter: "drop-shadow(0 24px 44px rgba(0,0,0,.7))" }} />
        ) : (
          <div style={{ width: 128, height: 264, borderRadius: 30, padding: 7, background: "linear-gradient(160deg,#1b2440,#0a0e1d)", border: "1px solid rgba(255,255,255,.1)", transform: "translateZ(40px)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 24, background: `linear-gradient(165deg,${g1},${g2})`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 44, height: 13, borderRadius: 8, background: "#05070f" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg,rgba(255,255,255,.3),transparent 40%)" }} />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ position: "relative", zIndex: 4, padding: 18 }}>
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#94A3B8", margin: "0 0 6px" }}>{product.category?.name || ""}</p>
        <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 18, margin: "0 0 4px" }}>{product.name}</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 19, color: "#fff" }}>{(product.price || 0).toLocaleString()} DA</span>
          <span style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,var(--secondary),var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: "0 8px 20px -6px rgb(var(--primary-rgb) / .8)" }}>→</span>
        </div>
      </div>
    </div>
  );
}

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/products?featured=true`)
      .then(r => setProducts((r.data || []).slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!products.length) return null;

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "54px 26px 30px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12.5, letterSpacing: ".12em", color: "var(--accent)", margin: "0 0 10px" }}>// TRENDING NOW</p>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,4vw,46px)", letterSpacing: "-.02em", margin: 0 }}>Best sellers</h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(248px,1fr))", gap: 18 }}>
        {products.map((p, i) => (
          <TiltCard key={p._id} product={p} index={i} onClick={() => navigate(`/products/${p._id}`)} />
        ))}
      </div>
    </section>
  );
}
