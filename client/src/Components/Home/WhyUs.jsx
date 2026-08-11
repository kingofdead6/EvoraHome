import { store } from "../../store.config.js";

const FEATURES = [
  { icon: "🛡", title: "100% Original", desc: "Every device comes with official manufacturer warranty. No refurbished, no grey market." },
  { icon: "🚚", title: "48h Delivery", desc: "Fast shipping across Algeria. Order today, receive in 48 hours, pay on delivery." },
  { icon: "💳", title: "Cash on Delivery", desc: "No payment upfront. Inspect your device, then pay. Zero risk for you." },
  { icon: "🔧", title: "After-Sale Support", desc: "Expert team available for setup help, troubleshooting, and warranty claims." },
];

export default function WhyUs() {
  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 26px 30px" }}>
      <div style={{ textAlign: "center", marginBottom: 42 }}>
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12.5, letterSpacing: ".12em", color: "var(--accent)", margin: "0 0 10px" }}>// WHY {store.brand.name}</p>
        <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,4vw,46px)", letterSpacing: "-.02em", margin: 0 }}>Built on trust.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            style={{
              position: "relative", borderRadius: 20, padding: "28px 24px",
              border: "1px solid rgba(255,255,255,.08)",
              background: "linear-gradient(170deg,rgba(255,255,255,.05),rgba(255,255,255,.01))",
              overflow: "hidden",
              animation: `fadeUp .6s both`,
              animationDelay: `${i * 0.08}s`,
              transition: "transform .3s,border-color .3s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgb(var(--secondary-rgb) / .45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}
          >
            <div style={{ width: 54, height: 54, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, background: "linear-gradient(135deg,rgb(var(--secondary-rgb) / .25),rgb(var(--accent-rgb) / .15))", border: "1px solid rgb(var(--secondary-rgb) / .3)", marginBottom: 18 }}>{f.icon}</div>
            <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 19, margin: "0 0 8px" }}>{f.title}</h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#94A3B8", margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
