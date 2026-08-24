import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getToken } from "../utils/api";

// =====================================================
// AUTH CONTEXT
// =====================================================

const AuthContext = createContext(null);

// =====================================================
// AUTH PROVIDER
// =====================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  // ===================================================
  // LOAD SAVED LOGIN
  // ===================================================

  useEffect(() => {
    console.log("AUTH: Loading saved login...");

    try {
      const savedToken = getToken();

      const savedUser =
        localStorage.getItem("festivalUser") ||
        localStorage.getItem("user");

      let parsedUser = null;

      // -----------------------------------------------
      // READ SAVED USER
      // -----------------------------------------------

      if (savedUser) {
        try {
          parsedUser = JSON.parse(savedUser);
        } catch (error) {
          console.error(
            "AUTH: Invalid saved user",
            error
          );

          localStorage.removeItem("festivalUser");
          localStorage.removeItem("user");
        }
      }

      // -----------------------------------------------
      // LOAD TOKEN
      // -----------------------------------------------

      if (savedToken) {
        console.log("AUTH: Saved token found");

        setToken(savedToken);
      } else {
        console.log("AUTH: No saved token");
      }

      // -----------------------------------------------
      // LOAD USER
      // -----------------------------------------------

      if (parsedUser) {
        console.log(
          "AUTH: Saved user found:",
          parsedUser
        );

        setUser(parsedUser);
      } else {
        console.log("AUTH: No saved user");
      }
    } catch (error) {
      console.error(
        "AUTH INITIALIZATION ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================================================
  // LOGIN
  // ===================================================

  /*
    IMPORTANT:

    This function supports BOTH:

    login({
      token: "...",
      user: {...}
    })

    AND your existing code:

    login(data.token, data.user)

    So we don't have to break your existing pages.
  */

  const login = (
    loginData,
    secondUser = null
  ) => {
    console.log(
      "AUTH LOGIN DATA:",
      loginData
    );

    try {
      let receivedToken = null;
      let receivedUser = null;

      // =================================================
      // CASE 1
      // login(data.token, data.user)
      // =================================================

      if (
        typeof loginData === "string"
      ) {
        receivedToken = loginData;

        receivedUser = secondUser;
      }

      // =================================================
      // CASE 2
      // login({ token, user })
      // =================================================

      else if (
        loginData &&
        typeof loginData === "object"
      ) {
        receivedToken =
          loginData.token ||
          loginData.accessToken ||
          loginData.jwt ||
          loginData.data?.token ||
          loginData.data?.accessToken ||
          null;

        receivedUser =
          loginData.user ||
          loginData.data?.user ||
          null;
      }

      // =================================================
      // LOG
      // =================================================

      console.log(
        "AUTH RECEIVED TOKEN:",
        receivedToken
          ? "YES"
          : "NO"
      );

      console.log(
        "AUTH RECEIVED USER:",
        receivedUser
      );

      // =================================================
      // TOKEN REQUIRED
      // =================================================

      if (!receivedToken) {
        console.error(
          "AUTH LOGIN FAILED: TOKEN NOT FOUND",
          loginData
        );

        throw new Error(
          "Login successful but authentication token was not received."
        );
      }

      // =================================================
      // SAVE TOKEN
      // =================================================

      localStorage.setItem(
        "festivalToken",
        receivedToken
      );

      localStorage.setItem(
        "token",
        receivedToken
      );

      // Keep these in case any old code uses them
      localStorage.setItem(
        "authToken",
        receivedToken
      );

      localStorage.setItem(
        "accessToken",
        receivedToken
      );

      // =================================================
      // UPDATE TOKEN STATE
      // =================================================

      setToken(receivedToken);

      // =================================================
      // SAVE USER
      // =================================================

      if (receivedUser) {
        localStorage.setItem(
          "festivalUser",
          JSON.stringify(receivedUser)
        );

        localStorage.setItem(
          "user",
          JSON.stringify(receivedUser)
        );

        setUser(receivedUser);
      } else {
        console.warn(
          "AUTH: User object was not returned"
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      console.log(
        "AUTH: LOGIN SUCCESS"
      );

      console.log(
        "AUTH: TOKEN SAVED"
      );

      console.log(
        "AUTH: USER SAVED"
      );

      return {
        success: true,
        token: receivedToken,
        user: receivedUser,
      };
    } catch (error) {
      console.error(
        "AUTH LOGIN ERROR:",
        error
      );

      throw error;
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    console.log(
      "AUTH: Logging out..."
    );

    // -----------------------------------------------
    // REMOVE TOKENS
    // -----------------------------------------------

    localStorage.removeItem(
      "festivalToken"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "authToken"
    );

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "festivalAuthToken"
    );

    // -----------------------------------------------
    // REMOVE USER
    // -----------------------------------------------

    localStorage.removeItem(
      "festivalUser"
    );

    localStorage.removeItem(
      "user"
    );

    // -----------------------------------------------
    // CLEAR STATE
    // -----------------------------------------------

    setToken(null);

    setUser(null);

    console.log(
      "AUTH: Logout complete"
    );
  };

  // ===================================================
  // ROLE
  // ===================================================

  const role = String(
    user?.role || "viewer"
  )
    .toLowerCase()
    .trim();

  // ===================================================
  // ROLE FLAGS
  // ===================================================

  const isAdmin =
    role === "admin";

  const isEditor =
    role === "editor";

  const isViewer =
    role === "viewer";

  // ===================================================
  // PERMISSION
  // ===================================================

  const canEdit =
    isAdmin ||
    isEditor;

  // ===================================================
  // AUTHENTICATED
  // ===================================================

  const isAuthenticated =
    Boolean(token);

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = {
    // User
    user,
    setUser,

    // Token
    token,
    setToken,

    // Loading
    loading,

    // Login
    login,

    // Logout
    logout,

    // Role
    role,

    isAdmin,

    isEditor,

    isViewer,

    // Permission
    canEdit,

    // Authentication
    isAuthenticated,
  };

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// USE AUTH
// =====================================================

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default AuthContext;