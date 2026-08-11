import { Link } from "react-router-dom";
import { store } from "../../store.config.js";

const linkStyle = {
  fontSize: 14, color: "#94A3B8", textDecoration: "none", transition: "color .2s",
};

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      style={linkStyle}
      onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
      onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: "rgba(15,23,42,.97)", borderTop: "1px solid rgba(255,255,255,.08)", padding: "64px 26px 32px", marginTop: 40 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 44, marginBottom: 56 }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: "linear-gradient(135deg,var(--secondary),var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px -6px rgb(var(--primary-rgb) / .8)", flexShrink: 0 }}>
                <span style={{ width: 13, height: 13, borderRadius: 4, background: "#fff", transform: "rotate(45deg)", display: "block" }} />
              </span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-.02em", color: "#fff" }}>
                {store.brand.name}<span style={{ color: "var(--accent)" }}>.</span>
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "#64748B", margin: "0 0 18px" }}>
              {store.brand.tagline}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {["📘", "📸", "🐦"].map((icon, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", color: "#fff", margin: "0 0 18px", textTransform: "uppercase" }}>Shop</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/products">Products</FooterLink>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", color: "#fff", margin: "0 0 18px", textTransform: "uppercase" }}>Services</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <FooterLink to="/contact">Contact Us</FooterLink>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 13, letterSpacing: ".08em", color: "#fff", margin: "0 0 18px", textTransform: "uppercase" }}>Contact</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 14, color: "#64748B" }}>
              <a href={`tel:${store.contact.phoneHref}`} style={{ color: "#64748B", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
              >
                📞 {store.contact.phone}
              </a>
              <a href={`mailto:${store.contact.email}`} style={{ color: "#64748B", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
              >
                ✉️ {store.contact.email}
              </a>
              <span>📍 {store.contact.address}</span>
            </div>
          </div>

          {/* CTA Card */}
          <div style={{ background: "linear-gradient(135deg,rgb(var(--primary-rgb) / .18),rgb(var(--secondary-rgb) / .1))", border: "1px solid rgb(var(--secondary-rgb) / .25)", borderRadius: 20, padding: "26px 24px" }}>
            <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>
              Need help choosing?
            </p>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 18px", lineHeight: 1.5 }}>
              Get in touch and we'll help you find the right product.
            </p>
            <Link
              to="/contact"
              style={{
                display: "inline-block", padding: "11px 22px", borderRadius: 12,
                background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff",
                fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 14,
                textDecoration: "none", boxShadow: "0 8px 20px -6px rgb(var(--primary-rgb) / .7)",
              }}
            >
              Get an Offer →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#334155", margin: 0 }}>
            © {new Date().getFullYear()} {store.brand.fullName}. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Privacy Policy","#"],["Terms","#"]].map(([lbl, href]) => (
              <a key={lbl} href={href} style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#334155", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
                onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
              >{lbl}</a>
            ))}
          </div>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#334155", margin: 0 }}>
            Made with 💜 in Algeria
          </p>
        </div>
      </div>
    </footer>
  );
}
