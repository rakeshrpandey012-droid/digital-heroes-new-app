const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      `Server returned ${response.status}: ${text.substring(
        0,
        300
      )}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

/* =========================================================
   AUTH
========================================================= */

export async function demoLogin() {
  return request("/api/auth/demo-login", {
    method: "POST",
  });
}

export async function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(userData) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function getCurrentUser() {
  return request("/api/auth/me", {
    method: "GET",
  });
}

export async function logoutUser() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

/* =========================================================
   HEALTH / DATABASE
========================================================= */

export async function getHealth() {
  return request("/api/health");
}

export async function getDatabaseStatus() {
  return request("/api/database/status");
}

/* =========================================================
   DRAWS
========================================================= */

export async function getCurrentDraw() {
  return request("/api/draws/current");
}

export async function getLatestDraw() {
  return request("/api/draws/latest");
}

export async function getDraws() {
  return request("/api/draws");
}

/* =========================================================
   WINNERS
========================================================= */

export async function getWinners() {
  return request("/api/draws/winners");
}

export async function getLatestWinners() {
  return request("/api/winners");
}

/* =========================================================
   CHARITIES
========================================================= */

export async function getCharities() {
  return request("/api/charities");
}

export async function getCharitySpotlight() {
  return request(
    "/api/charities/spotlight"
  );
}

/* =========================================================
   SCORES
========================================================= */

export async function getScores() {
  return request("/api/scores");
}

/* =========================================================
   ADMIN
========================================================= */

export async function getAdminDashboard() {
  return request("/api/admin/dashboard");
}

export default {
  demoLogin,
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,

  getHealth,
  getDatabaseStatus,

  getCurrentDraw,
  getLatestDraw,
  getDraws,

  getWinners,
  getLatestWinners,

  getCharities,
  getCharitySpotlight,

  getScores,

  getAdminDashboard,
};