import React from "react";

export default function Custom404() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0b", color: "#e5e2e3", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#9acbff", fontSize: "12px", letterSpacing: "0.1em", marginBottom: "8px" }}>404</p>
        <h1 style={{ fontSize: "36px", fontWeight: 600, marginBottom: "16px" }}>Page not found</h1>
        <p style={{ color: "#c1c7d0", marginBottom: "24px" }}>The page you are looking for doesn&apos;t exist.</p>
        <a href="/" style={{ display: "inline-block", padding: "10px 20px", background: "#9acbff", color: "#003355", borderRadius: "8px", textDecoration: "none", fontWeight: 500 }}>Go Home</a>
      </div>
    </div>
  );
}
