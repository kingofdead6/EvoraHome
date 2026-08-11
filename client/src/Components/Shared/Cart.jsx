"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (productId, change) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + change;
            return newQty >= 1 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter(item => item.quantity >= 1)
    );
  };

  const removeItem = (productId) => {
    setCartItems(prev =>
      prev.filter(item => item.productId !== productId)
    );
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 80, paddingLeft: 20, paddingRight: 20, textAlign: "center" }}>
        <Link
          to="/products"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#94A3B8", textDecoration: "none", marginBottom: 40, fontSize: 16 }}
        >
          <ArrowLeft size={20} /> Back to Shop
        </Link>
        <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(32px,6vw,56px)", color: "#fff", marginBottom: 40 }}>
          Your cart is empty
        </h1>
        <Link
          to="/products"
          style={{ display: "inline-block", padding: "16px 32px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, borderRadius: 14, textDecoration: "none" }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 128 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <Link to="/products" style={{ color: "#94A3B8", textDecoration: "none" }}>
            <ArrowLeft size={28} />
          </Link>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,5vw,48px)", color: "#fff", margin: 0 }}>
            Your Cart ({cartItems.length})
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 40 }}>
          {/* Cart Items */}
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 16 }}>
            {cartItems.map(item => (
              <div
                key={item.productId}
                style={{ background: "rgba(15,23,42,.7)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(10px)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: 20, flexWrap: "wrap" }}>
                  <Link to={`/products/${item.productId}`}>
                    <div style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
                      <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  </Link>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 17, color: "#fff", margin: "0 0 12px" }}>
                      {item.name}
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >−</button>
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#fff", width: 32, textAlign: "center" }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >+</button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 20, color: "var(--secondary)", margin: 0 }}>
                        {(item.price * item.quantity).toLocaleString()} DA
                      </p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        style={{ fontSize: 13, color: "#64748B", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ background: "rgba(15,23,42,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: 28, backdropFilter: "blur(16px)", alignSelf: "start", gridColumn: "1 / -1", maxWidth: 420, marginLeft: "auto" }}>
            <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 22, color: "#fff", margin: "0 0 24px" }}>
              Order Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 16, color: "#94A3B8" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{subtotal.toLocaleString()} DA</span>
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                <span>Total</span>
                <span style={{ color: "var(--secondary)" }}>{subtotal.toLocaleString()} DA</span>
              </div>
            </div>

            <Link to="/checkout" style={{ display: "block", marginTop: 28 }}>
              <button style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 17, borderRadius: 14, border: "none", cursor: "pointer", boxShadow: "0 16px 40px -12px rgb(var(--primary-rgb) / .9)" }}>
                Proceed to Checkout
              </button>
            </Link>

            <Link
              to="/products"
              style={{ display: "block", textAlign: "center", marginTop: 16, color: "#64748B", textDecoration: "none", fontSize: 14 }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
