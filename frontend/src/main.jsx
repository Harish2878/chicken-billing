import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

// Register Service Worker for Mobile PWA (Enables Android Home-Screen Installation)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SKD Chicken Service Worker registered:", reg.scope);
      })
      .catch((err) => {
        console.log("Service Worker registration notice:", err);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
