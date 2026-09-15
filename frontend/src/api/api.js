

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

// ── Auth helpers 
export const getToken = () => localStorage.getItem("parkease_token");
export const getUserId = () => localStorage.getItem("parkease_userId");
export const getUserName = () => localStorage.getItem("parkease_name");
export const getUserRole = () => localStorage.getItem("parkease_role");

export const saveAuth = (data) => {
  localStorage.setItem("parkease_token", data.token);
  localStorage.setItem("parkease_userId", String(data.userId));
  localStorage.setItem("parkease_name", data.name);
  localStorage.setItem("parkease_role", data.role);
};

export const clearAuth = () => {
  [
    "parkease_token", "parkease_userId", "parkease_name", "parkease_role",
    "parkease_active_booking", "parkease_account_status", "parkease_outstanding",
    "parkease_warnings", "parkease_booking_history",
  ].forEach(k => localStorage.removeItem(k));
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const body = await res.json(); msg = body.message || body.error || msg; } catch { }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (body) => api.post("/auth/login", body),
  register: (body) => api.post("/auth/register", body),
};

// ── User — Parkings ───────────────────────────────────────────────────────────
export const parkingsAPI = {
  getAll: () => api.get("/user/parkings"),
  getById: (id) => api.get(`/user/parkings/${id}`),
};

// ── User — Bookings ───────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (body) => api.post("/user/bookings", body),
  getAll: () => api.get("/user/bookings"),
  cancel: (id) => api.patch(`/user/bookings/${id}/cancel`),
  getActive: () => api.get("/user/bookings/active"),
};

// ── User — Payments ───────────────────────────────────────────────────────────
export const paymentsAPI = {
  initiate: (body) => api.post("/user/payments/initiate", body),
  confirm: (paymentId, body) => api.post(`/user/payments/${paymentId}/confirm`, body),
  endParking: (bookingId) => api.post(`/user/payments/end-parking/${bookingId}`),
  penaltyInitiate: (body) => api.post("/user/payments/penalty/initiate", body),
  penaltyPayLater: (bookingId) => api.post(`/user/payments/penalty/pay-later/${bookingId}`),
  getHistory: () => api.get("/user/payments/history"),
};

// ── User — Dashboard ──────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get("/user/dashboard/stats"),
};

// ── Owner — Parkings ──────────────────────────────────────────────────────────
export const ownerParkingsAPI = {
  create: (body) => api.post("/owner/parkings", body),
  getAll: () => api.get("/owner/parkings"),
  getById: (id) => api.get(`/owner/parkings/${id}`),
  addSlot: (id, body) => api.post(`/owner/parkings/${id}/slots`, body),
};

// ── Owner — Slots ─────────────────────────────────────────────────────────────
export const ownerSlotsAPI = {
  getById: (slotId) => api.get(`/owner/slots/${slotId}`),
  updateStatus: (slotId, body) => api.patch(`/owner/slots/${slotId}/status`, body),
  updatePrice: (slotId, body) => api.patch(`/owner/slots/${slotId}/price`, body),
  toggle: (slotId) => api.patch(`/owner/slots/${slotId}/toggle`),
};

// ── Owner — Bookings ──────────────────────────────────────────────────────────
export const ownerBookingsAPI = {
  getAll: () => api.get("/owner/bookings"),
  getByParking: (parkingId) => api.get(`/owner/parkings/${parkingId}/bookings`),
  cancel: (bookingId) => api.patch(`/owner/bookings/${bookingId}/cancel`),
  complete: (bookingId) => api.patch(`/owner/bookings/${bookingId}/complete`),
};

// ── Owner — Dashboard ─────────────────────────────────────────────────────────
export const ownerDashboardAPI = {
  getStats: (parkingId) => api.get(parkingId ? `/owner/dashboard/stats?parkingId=${parkingId}` : "/owner/dashboard/stats"),
  getRevenue: (parkingId) => api.get(parkingId ? `/owner/dashboard/revenue?parkingId=${parkingId}` : "/owner/dashboard/revenue"),
};

// ── Chatbot ───────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (body) => api.post("/chat", body),
  clearHistory: (userId) => api.delete(`/chat/history/${userId}`),
};
