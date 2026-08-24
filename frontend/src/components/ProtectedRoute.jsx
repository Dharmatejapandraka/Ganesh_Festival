import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


// =====================================================
// PROTECTED ROUTE
// =====================================================

const ProtectedRoute = ({ children }) => {

  const {
    user,
    token,
    loading,
    isAuthenticated,
  } = useAuth();


  const location = useLocation();


  // ===================================================
  // WAIT FOR AUTH INITIALIZATION
  // ===================================================

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09070d",
          color: "#f5c542",
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );

  }


  // ===================================================
  // GET TOKEN DIRECTLY AS BACKUP
  // ===================================================

  const savedToken =
    localStorage.getItem("festivalToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");


  // ===================================================
  // AUTH CHECK
  // ===================================================

  const authenticated =
    isAuthenticated ||
    Boolean(token) ||
    Boolean(savedToken);


  console.log(
    "PROTECTED ROUTE:",
    {
      path: location.pathname,
      authenticated,
      hasContextToken: Boolean(token),
      hasSavedToken: Boolean(savedToken),
      hasUser: Boolean(user),
    }
  );


  // ===================================================
  // NOT LOGGED IN
  // ===================================================

  if (!authenticated) {

    console.log(
      "PROTECTED ROUTE: User is not authenticated"
    );


    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );

  }


  // ===================================================
  // LOGGED IN
  // ===================================================

  return children;

};


// =====================================================
// EXPORT
// =====================================================

export default ProtectedRoute;