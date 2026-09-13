import React, { useState } from "react";
// Import 'Dashboard' from the index file export
import { Dashboard } from "./pages/index";

const API_URL = "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const endpoint = isSignUp ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;
    const payload = isSignUp ? { email, password, name: shopName } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Authentication failed");
      const data = await response.json();

      if (isSignUp) {
        alert("Merchant workspace registration verified! Opening sign-in...");
        setIsSignUp(false);
        setShopName("");
      } else {
        localStorage.setItem("token", data.accessToken);
        setToken(data.accessToken);
      }
    } catch {
      alert(isSignUp ? "Registration error. Email index duplicate." : "Invalid merchant credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ 
        height: "100vh", 
        width: "100%", // FIX: Changed from 100vw to 100% to completely eliminate the horizontal scroll bar
        backgroundColor: "#060814", 
        color: "#F1F5F9", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontFamily: "system-ui, sans-serif", 
        padding: "24px", 
        boxSizing: "border-box",
        overflow: "hidden" // FIX: Disables accidental layout scroll leaks entirely
      }}>
        <div style={{ width: "100%", maxWidth: "1024px", backgroundColor: "#0B0F19", border: "1px solid #1E293B", borderRadius: "20px", overflow: "hidden", boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.7)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", minHeight: "560px", boxSizing: "border-box" }}>
          
          {/* Left Side: Khatabook Brand Panel */}
          <div style={{ background: "linear-gradient(145deg, #111A30 0%, #05070F 100%)", borderRight: "1px solid #1E293B", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ height: "32px", width: "32px", background: "linear-gradient(to top right, #10B981, #2DD4BF)", borderRadius: "8px", display: "flex" }}>
                <span style={{ color: "#060814", fontWeight: 900, fontSize: "15px", margin: "auto" }}>DL</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: "17px", color: "#FFFFFF" }}>Deepledger</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <h3 style={{ fontSize: "28px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.25, marginBottom: "16px" }}>
                Digital Credit Ledger <br />
                <span style={{ background: "linear-gradient(to right, #34D399, #2DD4BF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>For Modern Merchants.</span>
              </h3>
              <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.6, marginBottom: "28px" }}>
                Replace your traditional paper notebook bookkeeping. Manage outstanding profiles and transaction snapshot logs securely.
              </p>
            </div>
            <div style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace" }}>Isolated Tenant Cluster Node Core.</div>
          </div>

          {/* Right Side: Operational Input Fields Panel */}
          <div style={{ padding: "48px 40px", backgroundColor: "#080B14", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box" }}>
            <div style={{ width: "100%", maxWidth: "340px", margin: "0 auto", boxSizing: "border-box" }}>
              <div style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px 0" }}>{isSignUp ? "Register Workspace" : "Merchant Sign-In"}</h3>
                <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>{isSignUp ? "Initialize an isolated merchant notebook profile instance." : "Enter access metrics to open ledger accounting grids."}</p>
              </div>

              <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", boxSizing: "border-box" }}>
                {isSignUp && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748B" }}>Shop / Business Title</label>
                    <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} required placeholder="e.g., Sharma Grocery Stores" style={{ width: "100%", backgroundColor: "#05070D", border: "1px solid #1E293B", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "#F1F5F9", outline: "none", boxSizing: "border-box" }} />
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748B" }}>Merchant Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="merchant@shop.com" style={{ width: "100%", backgroundColor: "#05070D", border: "1px solid #1E293B", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "#F1F5F9", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748B" }}>Access Password Key</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••••••" style={{ width: "100%", backgroundColor: "#05070D", border: "1px solid #1E293B", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "#F1F5F9", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
                </div>

                <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(90deg, #10B981 0%, #14B8A6 100%)", border: "none", borderRadius: "12px", color: "#060814", fontSize: "13px", fontWeight: "extrabold", padding: "14px", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 20px rgba(16, 185, 129, 0.25)", boxSizing: "border-box" }}>
                  {loading ? "Verifying..." : isSignUp ? "Register Account" : "Sign In"}
                </button>
              </form>

              <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #1E293B", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                  {isSignUp ? "Already executing active ledgers?" : "New merchant operator?"}
                  <button type="button" onClick={() => { setIsSignUp(!isSignUp); setShopName(""); }} style={{ background: "none", border: "none", color: "#10B981", fontWeight: "bold", marginLeft: "6px", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                    {isSignUp ? "Sign In" : "Register Account"}
                  </button>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return <Dashboard />;
}
