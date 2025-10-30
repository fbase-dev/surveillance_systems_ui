"use client";

import { useState } from "react";

export default function CameraControl() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendCommand = async (cmd: string) => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/camera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ Success: ${JSON.stringify(data.data)}`);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatus(`❌ Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
        padding: "2rem",
        border: "1px solid #ddd",
        borderRadius: "1rem",
        width: "300px",
        margin: "3rem auto",
      }}
    >
      <h3>🎥 Camera Control</h3>

      <button
        onClick={() => sendCommand("up")}
        disabled={loading}
        style={{
          background: loading ? "#999" : "#0070f3",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "Sending..." : "Move Up"}
      </button>

      {status && (
        <p
          style={{
            fontSize: "14px",
            color: status.includes("✅") ? "green" : "red",
            textAlign: "center",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
