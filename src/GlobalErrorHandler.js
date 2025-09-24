// src/GlobalErrorHandler.js
import React, { useState, useEffect } from "react";

export default function GlobalErrorHandler() {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Catch synchronous runtime errors
    window.onerror = (message, source, lineno, colno, err) => {
      console.error("Global error caught:", { message, source, lineno, colno, err });
      setError(message || "An unexpected error occurred");
      return true; // Suppress default browser error
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      setError(event.reason?.message || "An unexpected error occurred in a promise");
      return true;
    };
  }, []);

  if (!error) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <h2>Oops! Something went wrong.</h2>
      <p>{error}</p>
      <button onClick={() => setError(null)}>Dismiss</button>
    </div>
  );
}
