import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
/* NOTE: This will render everything TWICE while developing -- you have been warned */
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);