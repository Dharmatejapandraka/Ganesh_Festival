import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { FestivalProvider } from "./context/FestivalContext";

import "./index.css";


ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <AuthProvider>

      <FestivalProvider>

        <App />

      </FestivalProvider>

    </AuthProvider>

  </React.StrictMode>

);