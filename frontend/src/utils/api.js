// =====================================================
// frontend/src/utils/api.js
// CENTRAL API HELPER
// =====================================================

// =====================================================
// API BASE URL
// =====================================================
//
// Local development:
// http://localhost:5000/api
//
// Production:
// https://ganesh-festival-backend-qzjm.onrender.com/api
//
// If VITE_API_URL exists, it will be used.
// Otherwise production backend will be used.
// =====================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ganesh-festival-backend-qzjm.onrender.com/api";

// =====================================================
// GET TOKEN
// =====================================================

export const getToken = () => {
  return (
    localStorage.getItem("festivalToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    null
  );
};

// =====================================================
// GET CURRENT USER
// =====================================================

export const getCurrentUser = () => {
  try {
    const savedUser =
      localStorage.getItem("festivalUser") ||
      localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    return JSON.parse(savedUser);
  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return null;
  }
};

// =====================================================
// GET USER ROLE
// =====================================================

export const getUserRole = () => {
  const user = getCurrentUser();

  return String(user?.role || "viewer")
    .toLowerCase()
    .trim();
};

// =====================================================
// CLEAR AUTH
// =====================================================

export const clearAuth = () => {
  localStorage.removeItem("festivalToken");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("accessToken");

  localStorage.removeItem("festivalUser");
  localStorage.removeItem("user");
};

// =====================================================
// CLEAN ENDPOINT
// =====================================================

const cleanEndpoint = (endpoint) => {
  if (!endpoint) {
    return "/";
  }

  let path = String(endpoint).trim();

  // ---------------------------------------------------
  // If complete URL was supplied
  // ---------------------------------------------------

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  // ---------------------------------------------------
  // Remove leading slashes
  // ---------------------------------------------------

  path = path.replace(/^\/+/, "");

  // ---------------------------------------------------
  // Prevent /api/api/...
  // ---------------------------------------------------

  if (path.startsWith("api/")) {
    path = path.substring(4);
  }

  return `/${path}`;
};

// =====================================================
// API FETCH
// =====================================================

export const apiFetch = async (
  endpoint,
  options = {}
) => {
  const cleanedPath =
    cleanEndpoint(endpoint);

  // ---------------------------------------------------
  // Build URL
  // ---------------------------------------------------

  const url =
    cleanedPath.startsWith("http://") ||
    cleanedPath.startsWith("https://")
      ? cleanedPath
      : `${API_BASE_URL}${cleanedPath}`;

  // ---------------------------------------------------
  // GET TOKEN
  // ---------------------------------------------------

  const token = getToken();

  // ---------------------------------------------------
  // HEADERS
  // ---------------------------------------------------

  const headers = {
    ...(options.headers || {}),
  };

  // ---------------------------------------------------
  // JSON CONTENT TYPE
  // ---------------------------------------------------

  if (
    options.body !== undefined &&
    options.body !== null &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  // ---------------------------------------------------
  // AUTHORIZATION
  // ---------------------------------------------------

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  // ---------------------------------------------------
  // REQUEST OPTIONS
  // ---------------------------------------------------

  const requestOptions = {
    ...options,
    headers,
  };

  // ---------------------------------------------------
  // DEBUG LOG
  // ---------------------------------------------------

  console.log(
    "================================="
  );

  console.log(
    "API REQUEST:",
    options.method || "GET"
  );

  console.log(
    "API URL:",
    url
  );

  console.log(
    "TOKEN:",
    token ? "FOUND" : "NOT FOUND"
  );

  console.log(
    "================================="
  );

  // ---------------------------------------------------
  // FETCH
  // ---------------------------------------------------

  try {
    const response = await fetch(
      url,
      requestOptions
    );

    // -------------------------------------------------
    // READ RESPONSE
    // -------------------------------------------------

    const text =
      await response.text();

    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = {
          message: text,
        };
      }
    }

    // -------------------------------------------------
    // RESPONSE LOG
    // -------------------------------------------------

    console.log(
      "API STATUS:",
      response.status
    );

    console.log(
      "API RESPONSE:",
      data
    );

    // =================================================
    // 401 - UNAUTHORIZED
    // =================================================

    if (response.status === 401) {
      clearAuth();

      throw new Error(
        data?.message ||
          "Authentication required. Please login again."
      );
    }

    // =================================================
    // 403 - FORBIDDEN
    // =================================================

    if (response.status === 403) {
      throw new Error(
        data?.message ||
          "You do not have permission to perform this action."
      );
    }

    // =================================================
    // 404 - NOT FOUND
    // =================================================

    if (response.status === 404) {
      throw new Error(
        data?.message ||
          `API route not found: ${
            options.method || "GET"
          } ${url}`
      );
    }

    // =================================================
    // OTHER ERRORS
    // =================================================

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed with status ${response.status}`
      );
    }

    // =================================================
    // SUCCESS
    // =================================================

    return data;
  } catch (error) {
    console.error(
      "API FETCH ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// GET
// =====================================================

export const get = async (
  endpoint,
  config = {}
) => {
  return apiFetch(
    endpoint,
    {
      ...config,
      method: "GET",
    }
  );
};

// =====================================================
// POST
// =====================================================

export const post = async (
  endpoint,
  body = null,
  config = {}
) => {
  const options = {
    ...config,
    method: "POST",
  };

  if (body instanceof FormData) {
    options.body = body;
  } else if (
    body !== null &&
    body !== undefined
  ) {
    options.body =
      JSON.stringify(body);
  }

  return apiFetch(
    endpoint,
    options
  );
};

// =====================================================
// PUT
// =====================================================

export const put = async (
  endpoint,
  body = null,
  config = {}
) => {
  const options = {
    ...config,
    method: "PUT",
  };

  if (body instanceof FormData) {
    options.body = body;
  } else if (
    body !== null &&
    body !== undefined
  ) {
    options.body =
      JSON.stringify(body);
  }

  return apiFetch(
    endpoint,
    options
  );
};

// =====================================================
// PATCH
// =====================================================

export const patch = async (
  endpoint,
  body = null,
  config = {}
) => {
  const options = {
    ...config,
    method: "PATCH",
  };

  if (body instanceof FormData) {
    options.body = body;
  } else if (
    body !== null &&
    body !== undefined
  ) {
    options.body =
      JSON.stringify(body);
  }

  return apiFetch(
    endpoint,
    options
  );
};

// =====================================================
// DELETE
// =====================================================

export const del = async (
  endpoint,
  config = {}
) => {
  return apiFetch(
    endpoint,
    {
      ...config,
      method: "DELETE",
    }
  );
};

// =====================================================
// DEFAULT API OBJECT
// =====================================================

const api = {
  get,
  post,
  put,
  patch,
  delete: del,

  getToken,
  getCurrentUser,
  getUserRole,
  clearAuth,

  apiFetch,
};

export default api;