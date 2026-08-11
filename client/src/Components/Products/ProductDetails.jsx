import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import { store } from "../../store.config.js";

const ACCORDIONS = [
  { title: "What's included", body: "Product as pictured. Packaging may vary. Check the product description for bundled items." },
  { title: "Warranty & returns", body: "6-month warranty on all products. 7-day return policy for unopened items in original condition." },
  { title: "Delivery info", body: "Fast delivery across Algeria within 48h. Cash on delivery. No hidden fees." },
];

function PriceBlock({ price }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 13, marginBottom: 26 }}>
      <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 38, background: "linear-gradient(120deg,#fff,var(--accent))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
        {(price || 0).toLocaleString()} DA
      </span>
    </div>
  );
}

function StockBadge({ stock }) {
  if (stock === undefined || stock === null || stock > 4) return null;
  if (stock === 0) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 10, background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.35)", marginBottom: 16 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "block" }} />
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#f87171", fontWeight: 600 }}>Out of stock</span>
      </div>
    );
  }
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 10, background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.35)", marginBottom: 16 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "block", animation: "ringPulse 2s infinite" }} />
      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>Only {stock} left in stock!</span>
    </div>
  );
}

function RelatedCard({ item, onClick }) {
  const cardRef = useRef(null);
  const onMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.transform = `perspective(800px) rotateX(${((e.clientY - rect.top) / rect.height - 0.5) * -8}deg) rotateY(${((e.clientX - rect.left) / rect.width - 0.5) * 8}deg)`;
    card.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };
  const onMouseLeave = () => { if (cardRef.current) cardRef.current.style.transform = "perspective(800px) rotateX(0) rotateY(0)"; };

  return (
    <div ref={cardRef} onClick={onClick} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      style={{ position: "relative", borderRadius: 22, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(170deg,rgba(255,255,255,.055),rgba(255,255,255,.015))", transition: "box-shadow .3s", transformStyle: "preserve-3d", "--mx": "50%", "--my": "50%" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 30px 56px -22px rgb(var(--primary-rgb) / .55)"}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(200px circle at var(--mx) var(--my),rgb(var(--secondary-rgb) / .18),transparent 60%)", pointerEvents: "none", zIndex: 3 }} />
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 30%,rgb(var(--secondary-rgb) / .14),transparent 60%)" }}>
        {item.images?.[0]?.url
          ? <img src={item.images[0].url} alt={item.name} style={{ maxWidth: "80%", maxHeight: 200, objectFit: "contain", filter: "drop-shadow(0 20px 30px rgba(0,0,0,.6))" }} />
          : <div style={{ width: 100, height: 100, borderRadius: 20, background: "linear-gradient(165deg,var(--secondary),var(--primary))" }} />
        }
      </div>
      <div style={{ position: "relative", zIndex: 4, padding: 16 }}>
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#94A3B8", margin: "0 0 4px" }}>{item.category?.name || ""}</p>
        <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, color: "var(--accent)", margin: 0 }}>{(item.price || 0).toLocaleString()} DA</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [related, setRelated] = useState([]);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [added, setAdded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setSelectedImg(0);
    axios.get(`${API_BASE_URL}/products/${id}`)
      .then(r => {
        setItem(r.data);
        const catId = r.data.category?._id;
        if (catId) {
          axios.get(`${API_BASE_URL}/products`)
            .then(r2 => setRelated((r2.data || []).filter(a => a.category?._id === catId && a._id !== id).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!item) return;
    const cartItem = { productId: item._id, name: item.name, price: item.price, image: item.images?.[selectedImg]?.url, quantity: 1, addedAt: new Date().toISOString() };
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex(i => i.productId === cartItem.productId);
    if (idx !== -1) cart[idx].quantity += 1;
    else cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Added to cart!");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const onTilt = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.transform = `rotateX(${((e.clientY - rect.top) / rect.height - 0.5) * -8}deg) rotateY(${((e.clientX - rect.left) / rect.width - 0.5) * 8}deg)`;
    card.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };
  const onTiltLeave = () => { if (cardRef.current) cardRef.current.style.transform = "rotateX(0) rotateY(0)"; };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'Space Grotesk'", fontSize: 22, color: "var(--secondary)", animation: "glowPulse 1.5s infinite" }}>Loading product…</p>
    </div>
  );
  if (!item) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'Space Grotesk'", fontSize: 22, color: "#94A3B8" }}>Product not found.</p>
    </div>
  );

  const images = item.images || [];

  return (
    <div style={{ animation: "fadeIn .5s", maxWidth: 1280, margin: "0 auto", padding: "34px 26px 80px" }}>
      <button onClick={() => navigate("/products")}
        style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "#94A3B8", background: "none", border: "none", cursor: "pointer", marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 7, transition: "color .2s" }}
        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
        onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
      >← Back to products</button>

      <div style={{ display: "flex", gap: 46, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Gallery */}
        <div style={{ flex: "0 0 500px", minWidth: 300, maxWidth: 560, position: "sticky", top: 96, animation: "fadeUp .6s both" }}>
          <div ref={cardRef} onMouseMove={onTilt} onMouseLeave={onTiltLeave}
            style={{ position: "relative", borderRadius: 30, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", background: "radial-gradient(circle at 50% 25%,rgb(var(--secondary-rgb) / .22),rgba(255,255,255,.02))", height: 540, display: "flex", alignItems: "center", justifyContent: "center", transformStyle: "preserve-3d", transition: "transform .25s", "--mx": "50%", "--my": "50%" }}
          >
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(300px circle at var(--mx) var(--my),rgb(var(--accent-rgb) / .18),transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgb(var(--secondary-rgb) / .5),transparent 65%)", filter: "blur(45px)", opacity: .45 }} />
            {images.length > 0 ? (
              <img src={images[selectedImg]?.url} alt={item.name}
                style={{ position: "relative", zIndex: 2, maxWidth: "82%", maxHeight: 480, objectFit: "contain", transform: "translateZ(50px)", filter: "drop-shadow(0 40px 70px rgba(0,0,0,.8))", transition: "opacity .25s" }}
              />
            ) : (
              <div style={{ position: "relative", zIndex: 2, width: 220, height: 220, borderRadius: 36, background: "linear-gradient(165deg,var(--secondary),var(--primary))", transform: "translateZ(50px)" }} />
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  style={{ width: 72, height: 72, borderRadius: 14, cursor: "pointer", overflow: "hidden", border: `2px solid ${i === selectedImg ? "var(--secondary)" : "rgba(255,255,255,.1)"}`, transition: "all .25s", padding: 0, background: "rgba(255,255,255,.03)" }}
                >
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 300, animation: "fadeUp .6s both .08s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            {item.category?.name && (
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, padding: "5px 11px", borderRadius: 8, background: "rgb(var(--secondary-rgb) / .16)", border: "1px solid rgb(var(--secondary-rgb) / .35)", color: "#d7c9ff" }}>{item.category.name}</span>
            )}
            {(item.stock === undefined || item.stock > 4) && (
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#86efac", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", animation: "ringPulse 2s infinite", display: "block" }} />
                In Stock
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-.025em", lineHeight: 1.08, margin: "0 0 12px" }}>{item.name}</h1>

          {item.description && (
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#94A3B8", margin: "0 0 18px" }}>{item.description}</p>
          )}

          <StockBadge stock={item.stock} />
          <PriceBlock price={item.price} />

          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <button onClick={addToCart} disabled={item.stock === 0} className="nv-mag-btn"
              style={{ flex: 1, minWidth: 180, padding: 17, border: "none", borderRadius: 15, background: added ? "linear-gradient(135deg,#10B981,#059669)" : item.stock === 0 ? "rgba(255,255,255,.08)" : "linear-gradient(135deg,var(--secondary),var(--primary))", color: item.stock === 0 ? "#64748B" : "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16.5, cursor: item.stock === 0 ? "not-allowed" : "pointer", boxShadow: item.stock === 0 ? "none" : "0 18px 44px -14px rgb(var(--primary-rgb) / .95)", transition: "background .4s" }}
            >
              {item.stock === 0 ? "Out of Stock" : added ? "✓ Added!" : "Add to Cart"}
            </button>
            <a href={`https://wa.me/${store.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="nv-mag-btn"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "17px 24px", border: "1px solid rgba(52,211,153,.45)", borderRadius: 15, background: "rgba(52,211,153,.12)", color: "#a7f3d0", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, cursor: "pointer", textDecoration: "none" }}
            >
              <span style={{ fontSize: 18 }}>💬</span> WhatsApp
            </a>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#94A3B8", margin: "0 0 26px" }}>
            🚚 Fast delivery 48h · 🔒 Cash on delivery · 🛡 Warranty included
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ACCORDIONS.map((acc, i) => (
              <div key={i} style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,.025)" }}>
                <button onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "none", border: "none", cursor: "pointer", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 15.5, textAlign: "left" }}
                >
                  {acc.title}
                  <span style={{ fontSize: 18, color: "var(--accent)", transition: "transform .3s", transform: openAccordion === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                {openAccordion === i && (
                  <div style={{ padding: "0 18px 18px", color: "#94A3B8", fontSize: 14.5, lineHeight: 1.6, animation: "fadeUp .3s" }}>{acc.body}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 28, letterSpacing: "-.02em", margin: "0 0 22px" }}>You might also like</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18 }}>
            {related.map(a => <RelatedCard key={a._id} item={a} onClick={() => navigate(`/products/${a._id}`)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
