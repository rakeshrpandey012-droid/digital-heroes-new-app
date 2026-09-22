const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      `Server returned ${response.status}: ${text.substring(0, 200)}`
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

// --------------------------------------------------
// AUTH
// --------------------------------------------------

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

// --------------------------------------------------
// DRAWS
// --------------------------------------------------

export async function getCurrentDraw() {
  return request("/api/draws/current", {
    method: "GET",
  });
}

export async function getLatestDraw() {
  return request("/api/draws/latest", {
    method: "GET",
  });
}

export async function getDraws() {
  return request("/api/draws", {
    method: "GET",
  });
}

// --------------------------------------------------
// WINNERS
// --------------------------------------------------

export async function getWinners() {
  return request("/api/draws/winners", {
    method: "GET",
  });
}

export async function getLatestWinners() {
  return request("/api/winners", {
    method: "GET",
  });
}

// --------------------------------------------------
// CHARITIES
// --------------------------------------------------

export async function getCharitySpotlight() {
  return request("/api/charities/spotlight", {
    method: "GET",
  });
}

export async function getCharities() {
  return request("/api/charities", {
    method: "GET",
  });
}

// --------------------------------------------------
// SCORES
// --------------------------------------------------

export async function getScores() {
  return request("/api/scores", {
    method: "GET",
  });
}

// --------------------------------------------------
// ADMIN
// --------------------------------------------------

export async function getAdminDashboard() {
  return request("/api/admin/dashboard", {
    method: "GET",
  });
}

// --------------------------------------------------
// HEALTH
// --------------------------------------------------

export async function getHealth() {
  return request("/api/health", {
    method: "GET",
  });
}

export async function getDatabaseStatus() {
  return request("/api/database/status", {
    method: "GET",
  });
}