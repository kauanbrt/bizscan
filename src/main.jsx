import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CnpjProvider } from "./contexts/CnpjContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CnpjProvider>
      <App />
    </CnpjProvider>
  </React.StrictMode>
);
