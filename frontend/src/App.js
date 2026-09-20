import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import ProtectedRoute from "./components/common/ProtectedRoute";
import Chatbot from "./components/common/Chatbot";

// Public pages
const LandingPage = lazy(() => import("./pages/Landing_page"));
const Login = lazy(() => import("./pages/Login"));
const RegisterChoice = lazy(() => import("./pages/RegisterChoice"));
const UserRegister = lazy(() => import("./pages/UserRegister"));
const Placeholder = lazy(() => import("./pages/Placeholder"));

// Owner registration + application status (semi-public — no JWT required)
const OwnerRegister = lazy(() => import("./pages/owner/OwnerRegister"));
const OwnerApplicationPending = lazy(() => import("./pages/owner/OwnerApplicationPending"));
const OwnerApplicationRejected = lazy(() => import("./pages/owner/OwnerApplicationRejected"));

// User pages
const UserDashboard = lazy(() => import("./pages/user/UserDashboard"));
const FindParking = lazy(() => import("./pages/user/FindParking"));
const ParkingSlots = lazy(() => import("./pages/user/ParkingSlots"));
const BookingHistory = lazy(() => import("./pages/user/BookingHistory"));
const PaymentsDashboard = lazy(() => import("./pages/user/PaymentsDashboard"));
const PaymentPage = lazy(() => import("./pages/user/PaymentPage"));
const ActiveParking = lazy(() => import("./pages/user/ActiveParking"));
const FinalBillPage = lazy(() => import("./pages/user/FinalBillPage"));
const SettingsPage = lazy(() => import("./pages/user/Settingspage"));

// Owner pages
const OwnerDashboard = lazy(() => import("./pages/owner/OwnerDashboard"));
const OwnerSlots = lazy(() => import("./pages/owner/OwnerSlots"));
const OwnerBookings = lazy(() => import("./pages/owner/OwnerBookings"));
const AddParking = lazy(() => import("./pages/owner/AddParking"));
const ManageParkingSlots = lazy(() => import("./pages/owner/ManageParkingSlots"));
const OwnerRevenue = lazy(() => import("./pages/owner/OwnerRevenue"));

// Dedicated Modular Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UsersManagement = lazy(() => import("./pages/admin/UsersManagement"));
const ParkingManagement = lazy(() => import("./pages/admin/ParkingManagement"));
const BookingManagement = lazy(() => import("./pages/admin/BookingManagement"));
const RevenueManagement = lazy(() => import("./pages/admin/RevenueManagement"));
const TransactionsPage = lazy(() => import("./pages/admin/TransactionsPage"));
const RefundsPage = lazy(() => import("./pages/admin/RefundsPage"));
const LiveParkingPage = lazy(() => import("./pages/admin/LiveParkingPage"));
const SlotHealthPage = lazy(() => import("./pages/admin/SlotHealthPage"));
const GhostSlotsPage = lazy(() => import("./pages/admin/GhostSlotsPage"));
const MaintenancePage = lazy(() => import("./pages/admin/MaintenancePage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const AuditLogsPage = lazy(() => import("./pages/admin/AuditLogsPage"));
const NotificationsPage = lazy(() => import("./pages/admin/NotificationsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const OwnerApprovalsPage = lazy(() => import("./pages/admin/OwnerApprovalsPage"));

// Sleek fallback component for instant transitions
const PageLoader = () => (
  <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-3 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin"></div>
  </div>
);

// Role wrappers
const U = ({ children }) => (
  <ProtectedRoute role="USER">{children}</ProtectedRoute>
);

const O = ({ children }) => (
  <ProtectedRoute role="OWNER">{children}</ProtectedRoute>
);

const A = ({ children }) => (
  <ProtectedRoute role="ADMIN">{children}</ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* ── Global AI Chatbot (floating widget) ── */}
        <Chatbot />

        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* -------- PUBLIC ROUTES -------- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            {/* -------- REGISTRATION FLOWS (SEPARATE USER & OWNER) -------- */}
            <Route path="/register" element={<RegisterChoice />} />
            <Route path="/register/user" element={<UserRegister />} />
            <Route path="/register/owner" element={<OwnerRegister />} />
            <Route path="/owner/register" element={<OwnerRegister />} />
            <Route path="/owner/application-pending" element={<OwnerApplicationPending />} />
            <Route path="/owner-pending" element={<OwnerApplicationPending />} />
            <Route path="/owner/application-rejected" element={<OwnerApplicationRejected />} />
            <Route path="/owner-rejected" element={<OwnerApplicationRejected />} />

            {/* -------- USER ROUTES -------- */}
            <Route path="/user/dashboard" element={<U><UserDashboard /></U>} />
            <Route path="/user/find-parking" element={<U><FindParking /></U>} />
            <Route path="/user/slots/:parkingId" element={<U><ParkingSlots /></U>} />
            <Route path="/user/bookings" element={<U><BookingHistory /></U>} />
            <Route path="/user/payments" element={<U><PaymentsDashboard /></U>} />
            <Route path="/user/payment" element={<U><PaymentPage /></U>} />
            <Route path="/user/active-parking" element={<U><ActiveParking /></U>} />
            <Route path="/user/final-bill" element={<U><FinalBillPage /></U>} />
            <Route path="/user/settings" element={<U><SettingsPage role="USER" /></U>} />

            {/* -------- OWNER ROUTES -------- */}
            <Route path="/owner/dashboard" element={<O><OwnerDashboard /></O>} />
            <Route path="/owner/parking/:parkingId/dashboard" element={<O><OwnerDashboard /></O>} />
            <Route path="/owner/revenue" element={<O><OwnerRevenue /></O>} />
            <Route path="/owner/add-parking" element={<O><AddParking /></O>} />
            <Route path="/owner/slots" element={<O><OwnerSlots /></O>} />
            <Route path="/owner/slots/:parkingId" element={<O><ManageParkingSlots /></O>} />
            <Route path="/owner/bookings" element={<O><OwnerBookings /></O>} />
            <Route path="/owner/bookings/:parkingId" element={<O><OwnerBookings /></O>} />
            <Route path="/owner/settings" element={<O><SettingsPage role="OWNER" /></O>} />

            {/* -------- ADMIN ROUTES (ParkEase Platform Control Center) -------- */}
            <Route path="/admin/dashboard" element={<A><AdminDashboard /></A>} />
            <Route path="/admin/users" element={<A><UsersManagement /></A>} />
            <Route path="/admin/parkings" element={<A><ParkingManagement /></A>} />
            <Route path="/admin/bookings" element={<A><BookingManagement /></A>} />
            <Route path="/admin/revenue" element={<A><RevenueManagement /></A>} />
            <Route path="/admin/transactions" element={<A><TransactionsPage /></A>} />
            <Route path="/admin/refunds" element={<A><RefundsPage /></A>} />
            <Route path="/admin/live-parking" element={<A><LiveParkingPage /></A>} />
            <Route path="/admin/slot-health" element={<A><SlotHealthPage /></A>} />
            <Route path="/admin/ghost-slots" element={<A><GhostSlotsPage /></A>} />
            <Route path="/admin/maintenance" element={<A><MaintenancePage /></A>} />
            <Route path="/admin/analytics" element={<A><AdminAnalyticsPage /></A>} />
            <Route path="/admin/reports" element={<A><ReportsPage /></A>} />
            <Route path="/admin/audit-logs" element={<A><AuditLogsPage /></A>} />
            <Route path="/admin/notifications" element={<A><NotificationsPage /></A>} />
            <Route path="/admin/settings" element={<A><AdminSettingsPage /></A>} />
            <Route path="/admin/owner-approvals" element={<A><OwnerApprovalsPage /></A>} />

            {/* -------- PLACEHOLDER ROUTES -------- */}
            <Route path="/settings" element={<Placeholder />} />
            <Route path="/live-parking" element={<Placeholder />} />
            <Route path="/analytics" element={<Placeholder />} />
            <Route path="/reservations" element={<Placeholder />} />
            <Route path="/payments" element={<Placeholder />} />

            {/* -------- 404 FALLBACK -------- */}
            <Route path="*" element={<Placeholder />} />

          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;