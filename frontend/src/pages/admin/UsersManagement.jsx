import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaSearch, FaSpinner, FaTimes, FaCar, FaSyncAlt, FaExclamationTriangle
} from "react-icons/fa";
import { api } from "../../api/api";
import { TableSkeleton } from "../../components/common/Skeleton";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/users");
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      toast.error(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openUserDetails = async (user) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const data = await api.get(`/admin/users/${user.id}`);
      setUserDetails(data);
    } catch (err) {
      toast.error("Failed to load user profile");
    } finally {
      setDetailsLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setActionLoading(true);
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      toast.success(`User marked as ${nextStatus}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, accountStatus: nextStatus } : u))
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => ({ ...prev, accountStatus: nextStatus }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search);

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || u.accountStatus === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const fmtMoney = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const fmtDate = (iso) => !iso ? "—" : new Date(iso).toLocaleDateString("en-IN", {
    month: "short", day: "numeric", year: "numeric"
  });

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Users & Owners Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60">
              {users.length} accounts
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage user accounts, roles, access levels, and outstanding penalty balances
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-fit"
        >
          <FaSyncAlt size={11} className={loading ? "animate-spin text-primary-600" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="parkease-card rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="parkease-input pl-9 pr-8 py-2 text-xs w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <FaTimes size={10} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="parkease-input py-2 px-3 text-xs cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Customers (USER)</option>
            <option value="OWNER">Parking Owners</option>
            <option value="ADMIN">Administrators</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="parkease-input py-2 px-3 text-xs cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Users Table with Skeleton */}
      {loading ? (
        <TableSkeleton rows={7} cols={6} />
      ) : error ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-600 dark:text-slate-300 flex flex-col items-center gap-3 border-rose-200 dark:border-rose-900/40">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Unable to load user registry</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-400 text-xs">
          No users matching your filters.
        </div>
      ) : (
        <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Bookings</th>
                  <th className="p-4">Outstanding</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email} {u.phone ? `• ${u.phone}` : ""}</p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === "ADMIN"
                            ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60"
                            : u.role === "OWNER"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.accountStatus === "ACTIVE"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                            : u.accountStatus === "SUSPENDED"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      {u.totalBookings || 0}
                    </td>

                    <td className="p-4">
                      {u.outstanding && u.outstanding > 0 ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400">{fmtMoney(u.outstanding)}</span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {fmtDate(u.createdAt)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openUserDetails(u)}
                          className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold text-xs transition-all cursor-pointer"
                        >
                          Details
                        </button>

                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => toggleUserStatus(u.id, u.accountStatus)}
                            disabled={actionLoading}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              u.accountStatus === "SUSPENDED"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100"
                            }`}
                          >
                            {u.accountStatus === "SUSPENDED" ? "Activate" : "Suspend"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.name}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FaSpinner className="text-primary-600 text-2xl animate-spin mb-2" />
                  <p className="text-xs text-slate-400">Loading user profile & history...</p>
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  {/* Account Summary Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Role</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{userDetails?.role}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{userDetails?.accountStatus}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Bookings</span>
                      <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-0.5">{userDetails?.totalBookings}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Lifetime Spend</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{fmtMoney(userDetails?.totalSpent)}</p>
                    </div>
                  </div>

                  {/* Penalty Status */}
                  {userDetails?.outstanding > 0 && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl">
                      <p className="font-bold text-rose-700 dark:text-rose-400 text-xs">Unpaid Penalty</p>
                      <p className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-1">{fmtMoney(userDetails.outstanding)}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Warning count: {userDetails.warningCount} / 5
                      </p>
                    </div>
                  )}

                  {/* Recent Bookings List */}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs mb-3 flex items-center gap-1.5">
                      <FaCar className="text-primary-600 dark:text-primary-400" /> Recent Bookings
                    </h3>
                    <div className="space-y-2">
                      {userDetails?.recentBookings?.length === 0 ? (
                        <p className="text-slate-400 py-3">No bookings yet.</p>
                      ) : (
                        userDetails?.recentBookings?.map((b) => (
                          <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{b.parkingName} [{b.slotCode}]</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{fmtDate(b.createdAt)} • {b.vehicleNumber}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(b.amount)}</span>
                              <p className="text-[9px] text-slate-400 uppercase">{b.status}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
