

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

// ── Auth helpers 
export const getToken = () => localStorage.getItem("parkease_token");
export const getUserId = () => localStorage.getItem("parkease_userId");
export const getUserName = () => localStorage.getItem("parkease_name");
export const getUserRole = () => localStorage.getItem("parkease_role");
export const getOwnerAppStatus = () => localStorage.getItem("parkease_owner_app_status");
export const getOwnerAppRef = () => localStorage.getItem("parkease_owner_app_ref");
export const getRejectionReason = () => localStorage.getItem("parkease_rejection_reason");

export const saveAuth = (data) => {
  localStorage.setItem("parkease_token", data.token);
  localStorage.setItem("parkease_userId", String(data.userId));
  localStorage.setItem("parkease_name", data.name);
  localStorage.setItem("parkease_role", data.role);
};

/** Save pending/rejected owner state (no JWT — just status for UI routing) */
export const saveOwnerAppStatus = (data) => {
  localStorage.setItem("parkease_owner_app_status", data.applicationStatus);
  if (data.applicationRef) localStorage.setItem("parkease_owner_app_ref", data.applicationRef);
  if (data.rejectionReason) localStorage.setItem("parkease_rejection_reason", data.rejectionReason);
  // Store email for the pending/rejected pages to show
  if (data.email) localStorage.setItem("parkease_pending_email", data.email);
};

export const clearAuth = () => {
  [
    "parkease_token", "parkease_userId", "parkease_name", "parkease_role",
    "parkease_active_booking", "parkease_account_status", "parkease_outstanding",
    "parkease_warnings", "parkease_booking_history",
    "parkease_owner_app_status", "parkease_owner_app_ref", "parkease_rejection_reason",
    "parkease_pending_email",
  ].forEach(k => localStorage.removeItem(k));
};

function sanitizeErrorMessage(msg) {
  if (!msg || typeof msg !== "string") return "An unexpected error occurred.";
  if (msg.includes("violates check constraint") || msg.includes("users_account_status_check")) {
    return "Invalid account data. Please check your information and try again.";
  }
  if (msg.includes("could not execute statement") || msg.includes("SQL [") || msg.includes("DataIntegrityViolationException")) {
    return "Unable to save your request to the database. Please try again.";
  }
  return msg;
}

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
    let body = null;
    try { body = await res.json(); msg = body.message || body.error || msg; } catch { }
    msg = sanitizeErrorMessage(msg);
    // Attach extra fields for owner pending/rejected handling
    const err = new Error(msg);
    if (body) {
      err.applicationStatus = body.applicationStatus;
      err.applicationRef = body.applicationRef;
      err.rejectionReason = body.rejectionReason;
    }
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

/** Multipart/form-data request — used for owner application submission */
async function requestMultipart(path, formData) {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const body = await res.json(); msg = body.message || body.error || msg; } catch { }
    msg = sanitizeErrorMessage(msg);
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

// ── Owner Application (applicant-facing) ──────────────────────────────────────
export const ownerApplicationAPI = {
  /** Submit owner application as multipart form */
  submit: (formData) => requestMultipart("/owner-applications/submit", formData),
  /** Get current user's application status — requires JWT */
  getMyApplication: () => request("/owner-applications/me"),
  /** Check application status by reference without requiring JWT */
  checkStatusByRef: (ref) => request(`/owner-applications/status/${encodeURIComponent(ref)}`),
};

// ── Owner Approvals (admin-facing) ────────────────────────────────────────────
export const ownerApprovalAPI = {
  getAll: (status) => api.get(status ? `/admin/owner-approvals?status=${status}` : "/admin/owner-approvals"),
  getStats: () => api.get("/admin/owner-approvals/stats"),
  getById: (id) => api.get(`/admin/owner-approvals/${id}`),
  approve: (id, body) => api.post(`/admin/owner-approvals/${id}/approve`, body || {}),
  reject: (id, body) => api.post(`/admin/owner-approvals/${id}/reject`, body),
  markUnderReview: (id) => api.post(`/admin/owner-approvals/${id}/review`),
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

// ── Document download URL helper ──────────────────────────────────────────────
export const getDocumentUrl = (documentId) => `${BASE}/documents/${documentId}`;
