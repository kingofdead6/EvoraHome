import { useNavigate } from "react-router-dom";

const SERVICES = [
  {
    icon: "🛍️",
    label: "Browse Products",
    desc: "Explore our full catalog. Quality products at the best prices, delivered fast across Algeria.",
    to: "/products",
    gradient: ["var(--secondary)", "var(--primary)"],
    glow: "rgb(var(--primary-rgb) / .7)",
    tag: "SHOP",
  },
  {
    icon: "📞",
    label: "Contact Us",
    desc: "Have a question or need advice? Our team is ready to help you find the right product.",
    to: "/contact",
    gradient: ["var(--accent)", "#0891b2"],
    glow: "rgb(var(--accent-rgb) / .55)",
    tag: "CONTACT",
    highlight: true,
  },
  {
    icon: "🚚",
    label: "Fast Delivery",
    desc: "Cash on delivery across Algeria within 48h. No hidden fees, no surprises.",
    to: "/products",
    gradient: ["#10B981", "#065F46"],
    glow: "rgba(16,185,129,.55)",
    tag: "DELIVERY",
  },
];

export default function ServicesSection() {
  const navigate = useNavigate();

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 26px 70px" }}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12.5, letterSpacing: ".12em", color: "var(--accent)", margin: "0 0 12px" }}>
          // OUR SERVICES
        </p>
        <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(26px,4vw,44px)", letterSpacing: "-.02em", margin: 0, lineHeight: 1.15 }}>
          More than just a store.
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
        {SERVICES.map(({ icon, label, desc, to, gradient, glow, tag, highlight }) => (
          <div
            key={tag}
            onClick={() => navigate(to)}
            style={{
              position: "relative",
              borderRadius: 24,
              cursor: "pointer",
              border: `1px solid ${highlight ? "rgb(var(--accent-rgb) / .25)" : "rgba(255,255,255,.08)"}`,
              background: highlight
                ? "linear-gradient(165deg,rgb(var(--accent-rgb) / .07),rgba(8,145,178,.04))"
                : "linear-gradient(165deg,rgba(255,255,255,.05),rgba(255,255,255,.01))",
              padding: "36px 32px",
              overflow: "hidden",
              transition: "transform .25s, border-color .25s, box-shadow .25s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.borderColor = highlight ? "rgb(var(--accent-rgb) / .5)" : "rgba(255,255,255,.18)";
              e.currentTarget.style.boxShadow = `0 24px 50px -16px ${glow}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = highlight ? "rgb(var(--accent-rgb) / .25)" : "rgba(255,255,255,.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Background glow */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24 }}>
              <div style={{ position: "absolute", bottom: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `linear-gradient(135deg,${gradient[0]},${gradient[1]})`, filter: "blur(44px)", opacity: 0.35 }} />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: `linear-gradient(135deg,${gradient[0]},${gradient[1]})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, boxShadow: `0 8px 24px -6px ${glow}`,
                }}>
                  {icon}
                </div>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10.5, letterSpacing: ".1em", color: "rgba(255,255,255,.35)", padding: "5px 10px", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8 }}>
                  {tag}
                </span>
              </div>

              <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 20, margin: "0 0 10px" }}>
                {label}
              </h3>
              <p style={{ fontFamily: "'Manrope'", fontSize: 14.5, color: "#94A3B8", margin: "0 0 28px", lineHeight: 1.6 }}>
                {desc}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 14, color: gradient[0] }}>
                  Get Started
                </span>
                <span style={{ fontSize: 14, color: gradient[0] }}>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
