import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { store } from "../../store.config.js";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [userType, setUserType] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); setCartOpen(false); }, [location.pathname]);

  const checkAuth = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try { setUserType(jwtDecode(token).usertype); }
      catch { setUserType(null); }
    } else { setUserType(null); }
  };

  const loadCart = () => {
    const raw = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(raw);
  };

  useEffect(() => {
    checkAuth(); loadCart();
    const h = () => { checkAuth(); loadCart(); };
    window.addEventListener("storage", h);
    window.addEventListener("authChanged", h);
    window.addEventListener("cartUpdated", loadCart);
    return () => {
      window.removeEventListener("storage", h);
      window.removeEventListener("authChanged", h);
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUserType(null);
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  const cartCount = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const cartTotal = cartItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const isAdmin = userType === "admin" || userType === "superadmin";

  const updateQty = (idx, delta) => {
    const updated = cartItems.map((item, i) => {
      if (i !== idx) return item;
      return { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) };
    });
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (idx) => {
    const updated = cartItems.filter((_, i) => i !== idx);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const navItems = isAdmin
    ? [
        { label: "Dashboard", to: "/admin/dashboard" },
        { label: "Commandes", to: "/admin/orders" },
        { label: "Produits", to: "/admin/products" },
      ]
    : [
        { label: "Home", to: "/" },
        { label: "Products", to: "/products" },
        { label: "Contact", to: "/contact" },
      ];

  return (
    <>
      {/* ── HEADER ── */}
      <header
        className={`sticky top-0 z-[90] backdrop-blur-[22px] saturate-150 border-b border-white/[0.08] transition-all duration-300 ${
          scrolled
            ? "bg-[linear-gradient(180deg,rgba(5,8,22,.95),rgba(5,8,22,.8))]"
            : "bg-[linear-gradient(180deg,rgba(5,8,22,.82),rgba(5,8,22,.45))]"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-[26px] py-3.5 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-[11px] no-underline shrink-0">
            <span className="relative w-[34px] h-[34px] rounded-[11px] bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-[0_8px_24px_-6px_rgb(var(--primary-rgb)_/_.8)]">
              <span className="w-[13px] h-[13px] rounded-[4px] bg-white rotate-45 shadow-[0_0_12px_rgba(255,255,255,.7)] block" />
            </span>
            <span className="font-['Space_Grotesk'] font-bold text-xl tracking-[-0.02em] text-white">
              {store.brand.name}<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((n) => {
              const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`font-['Manrope'] font-semibold text-[14.5px] px-4 py-[9px] rounded-[11px] border transition-all duration-[250ms] no-underline ${
                    active
                      ? "text-white bg-[rgb(var(--secondary-rgb)_/_.2)] border-[rgb(var(--secondary-rgb)_/_.5)]"
                      : "text-white/65 bg-transparent border-transparent hover:text-white hover:bg-white/[0.07] hover:border-white/20"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            {!isAdmin && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-[9px] font-['Manrope'] font-semibold text-sm text-white bg-white/[0.05] border border-white/[0.08] px-[15px] py-[9px] rounded-[12px] cursor-pointer transition-all duration-[250ms] hover:bg-[rgb(var(--secondary-rgb)_/_.18)] hover:border-[rgb(var(--secondary-rgb)_/_.5)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="min-w-[20px] h-5 px-[5px] rounded-[10px] bg-gradient-to-br from-accent to-[#0891b2] text-[#031018] text-[11.5px] font-extrabold flex items-center justify-center shadow-[0_0_12px_rgb(var(--accent-rgb)_/_.6)]">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {isAdmin && (
              <button
                onClick={handleLogout}
                className="font-['Manrope'] font-semibold text-sm text-white/70 bg-transparent border border-white/[0.12] px-4 py-[9px] rounded-[11px] cursor-pointer hover:text-white hover:border-white/30 transition-all duration-[250ms]"
              >
                Déconnexion
              </button>
            )}

            {/* Burger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden flex flex-col gap-1 items-center justify-center w-[42px] h-[42px] rounded-[12px] bg-white/[0.05] border border-white/[0.08] cursor-pointer text-white"
            >
              {[0, 1, 2].map(i => (
                <span key={i} className="w-[18px] h-0.5 bg-current rounded-sm block" />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[100] bg-[rgba(5,8,22,.7)] backdrop-blur-[10px] [animation:fadeIn_.25s]"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="absolute top-0 right-0 bottom-0 w-[min(320px,80vw)] bg-[rgba(15,23,42,.96)] border-l border-white/[0.08] pt-20 px-6 pb-6 flex flex-col gap-2 [animation:drawerIn_.3s_cubic-bezier(.2,.9,.3,1)]"
          >
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-[10px] bg-white/[0.06] border border-white/[0.08] text-white cursor-pointer text-base flex items-center justify-center"
            >
              ✕
            </button>

            {navItems.map(n => {
              const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenuOpen(false)}
                  className={`font-['Space_Grotesk'] font-semibold text-[22px] no-underline border-b border-white/[0.08] py-4 px-1 transition-colors duration-200 ${
                    active ? "text-accent" : "text-white"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}

            {/* Auth actions in mobile menu */}
            {!isAdmin && (
              <button
                onClick={() => { setMenuOpen(false); setCartOpen(true); }}
                className="mt-4 flex items-center gap-3 font-['Space_Grotesk'] font-semibold text-lg text-white/70 bg-transparent border-none cursor-pointer py-3 px-1 border-b border-white/[0.08]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Cart {cartCount > 0 && <span className="text-accent">({cartCount})</span>}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="mt-4 font-['Space_Grotesk'] font-semibold text-lg text-white/70 bg-transparent border-none cursor-pointer text-left py-3 px-1"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          className="fixed inset-0 z-[110] bg-[rgba(5,8,22,.66)] backdrop-blur-[10px] [animation:fadeIn_.25s]"
        >
          <aside
            onClick={e => e.stopPropagation()}
            className="absolute top-0 right-0 bottom-0 w-[min(420px,92vw)] bg-[linear-gradient(180deg,rgba(15,23,42,.99),rgba(5,8,22,.99))] border-l border-white/[0.08] flex flex-col [animation:drawerIn_.35s_cubic-bezier(.2,.9,.3,1)] shadow-[-30px_0_80px_-20px_rgba(0,0,0,.7)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[22px] pt-[22px] pb-4 border-b border-white/[0.08]">
              <span className="font-['Space_Grotesk'] font-bold text-xl">
                Your Cart <span className="text-slate-400 text-sm font-medium">· {cartCount}</span>
              </span>
              <button
                onClick={() => setCartOpen(false)}
                className="w-[34px] h-[34px] rounded-[10px] bg-white/[0.06] border border-white/[0.08] text-white cursor-pointer text-base flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-[22px] py-4 flex flex-col gap-3.5">
              {cartItems.length === 0 ? (
                <div className="text-center py-[60px] px-2.5 text-slate-400">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-[18px] bg-[rgb(var(--secondary-rgb)_/_.12)] flex items-center justify-center text-[26px]">🛒</div>
                  <p className="font-['Space_Grotesk'] text-white text-[17px] mt-0 mb-1.5">Your cart is empty</p>
                  <p className="m-0 text-sm">Add a device to get started.</p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center bg-white/[0.03] border border-white/[0.08] rounded-2xl p-[11px]">
                    <div className="w-[54px] h-[74px] rounded-[11px] shrink-0 overflow-hidden bg-[rgb(var(--secondary-rgb)_/_.2)]">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 font-bold text-[14.5px] truncate">{item.name}</p>
                      <p className="mt-[7px] mb-0 font-['Space_Grotesk'] font-bold text-accent text-sm">{(item.price || 0).toLocaleString()} DA</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-2 bg-white/[0.05] rounded-[9px] p-[3px]">
                        <button onClick={() => updateQty(idx, -1)} className="w-6 h-6 rounded-[7px] border-none bg-white/[0.08] text-white cursor-pointer text-[15px] flex items-center justify-center">−</button>
                        <span className="font-['JetBrains_Mono'] text-[13px] min-w-[14px] text-center">{item.quantity || 1}</span>
                        <button onClick={() => updateQty(idx, 1)} className="w-6 h-6 rounded-[7px] border-none bg-white/[0.08] text-white cursor-pointer text-[15px] flex items-center justify-center">+</button>
                      </div>
                      <button onClick={() => removeItem(idx)} className="text-[11px] text-slate-400 bg-transparent border-none cursor-pointer hover:text-white transition-colors">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout */}
            {cartItems.length > 0 && (
              <div className="px-[22px] pt-[18px] pb-[22px] border-t border-white/[0.08] bg-white/[0.02]">
                <div className="flex justify-between items-baseline mb-3.5">
                  <span className="text-slate-400 text-sm">Total</span>
                  <span className="font-['Space_Grotesk'] font-bold text-2xl">{cartTotal.toLocaleString()} DA</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="block w-full py-[15px] border-none rounded-[14px] bg-gradient-to-br from-secondary to-primary text-white font-['Space_Grotesk'] font-bold text-base cursor-pointer no-underline text-center shadow-[0_16px_40px_-12px_rgb(var(--primary-rgb)_/_.9)]"
                >
                  Checkout · Cash on Delivery
                </Link>
                <p className="text-center mt-3 mb-0 text-[12.5px] text-slate-400">
                  🔒 Secure checkout · Free delivery across Algeria
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
