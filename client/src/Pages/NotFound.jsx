"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ fontSize: "clamp(96px,18vw,192px)", fontWeight: 300, letterSpacing: "-.04em", color: "rgb(var(--secondary-rgb) / .35)", lineHeight: 1, marginBottom: 24 }}
      >
        404
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(28px,5vw,52px)", letterSpacing: "-.02em", color: "#fff", marginBottom: 16 }}
      >
        Page Not Found
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{ fontSize: 18, lineHeight: 1.6, color: "#94A3B8", maxWidth: 520, marginBottom: 40 }}
      >
        The page you're looking for doesn't exist or has been moved. Let's get you back to shopping!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Link
          to="/products"
          style={{ display: "inline-flex", alignItems: "center", padding: "16px 32px", background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 17, borderRadius: 15, textDecoration: "none", boxShadow: "0 20px 46px -14px rgb(var(--primary-rgb) / .9)" }}
        >
          Back to Shop
        </Link>
      </motion.div>
    </div>
  );
}
