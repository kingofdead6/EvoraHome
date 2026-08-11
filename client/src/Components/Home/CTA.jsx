import { useNavigate } from "react-router-dom";

export default function PromoBanner() {
  const navigate = useNavigate();
  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "54px 26px 40px" }}>
      <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", border: "1px solid rgb(var(--secondary-rgb) / .3)", background: "linear-gradient(120deg,#1a0f3d,#0a0820)" }}>
        {/* Aurora blobs */}
        <div style={{ position: "absolute", top: "-30%", left: "-5%", width: "50%", height: "160%", background: "radial-gradient(circle,rgb(var(--primary-rgb) / .7),transparent 65%)", filter: "blur(50px)", animation: "auroraA 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "-20%", right: "-5%", width: "46%", height: "150%", background: "radial-gradient(circle,rgb(var(--accent-rgb) / .4),transparent 65%)", filter: "blur(55px)", animation: "auroraB 22s ease-in-out infinite" }} />

        <div className="nv-hero-row" style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, padding: "54px 50px" }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12.5, letterSpacing: ".12em", color: "var(--accent)", margin: "0 0 14px" }}>// LIMITED OFFER</p>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(30px,4.4vw,52px)", lineHeight: 1.04, letterSpacing: "-.025em", margin: "0 0 18px" }}>
              Trade in. Level up.<br />Save up to <span style={{ color: "var(--accent)" }}>40,000 DA</span>.
            </h2>
            <p style={{ fontSize: 17, color: "#cbd5e1", margin: "0 0 28px", lineHeight: 1.55 }}>
              Bring your old device, get instant credit toward any 2026 flagship. Free express delivery included.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="nv-mag-btn"
              style={{ padding: "15px 28px", border: "none", borderRadius: 14, background: "#fff", color: "#0a0820", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 16px 40px -12px rgba(255,255,255,.4)" }}
            >
              Claim the offer →
            </button>
          </div>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 170, height: 170, borderRadius: 34, background: "linear-gradient(135deg,var(--secondary),var(--accent))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 30px 60px -18px rgb(var(--primary-rgb) / .9)", animation: "floaty 6s ease-in-out infinite" }}>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 50, lineHeight: 1 }}>40K</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, letterSpacing: ".1em" }}>DA OFF</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
