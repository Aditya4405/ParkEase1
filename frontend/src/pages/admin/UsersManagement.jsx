import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Users & Owners Directory</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage user accounts, roles, access levels, and outstanding penalty balances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
            Total Accounts: <strong className="text-white">{users.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-black/20 border border-white/10 rounded-xl px-3 py-2 w-full md:w-80">
          <FaSearch className="text-gray-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-white">
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
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
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
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
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
        <div className="bg-[#1e293b] border border-neon-red/30 rounded-2xl p-12 text-center text-gray-300 flex flex-col items-center gap-3">
          <FaExclamationTriangle className="text-neon-red text-3xl" />
          <p className="text-sm font-bold text-white">Unable to load user registry</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No users matching your filters.
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[11px] text-gray-400">{u.email} {u.phone ? `• ${u.phone}` : ""}</p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          u.role === "ADMIN"
                            ? "bg-neon-purple/20 text-neon-purple border-neon-purple/30"
                            : u.role === "OWNER"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          u.accountStatus === "ACTIVE"
                            ? "bg-neon-green/20 text-neon-green border-neon-green/30"
                            : u.accountStatus === "SUSPENDED"
                            ? "bg-neon-red/20 text-neon-red border-neon-red/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-gray-300">
                      {u.totalBookings || 0}
                    </td>

                    <td className="p-4">
                      {u.outstanding && u.outstanding > 0 ? (
                        <span className="font-black text-neon-red">{fmtMoney(u.outstanding)}</span>
                      ) : (
                        <span className="text-gray-500">₹0</span>
                      )}
                    </td>

                    <td className="p-4 text-gray-400 text-[11px]">
                      {fmtDate(u.createdAt)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openUserDetails(u)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neon-blue border border-white/10 font-bold transition-all"
                        >
                          Details
                        </button>

                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => toggleUserStatus(u.id, u.accountStatus)}
                            disabled={actionLoading}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                              u.accountStatus === "SUSPENDED"
                                ? "bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20"
                                : "bg-neon-red/10 text-neon-red border-neon-red/30 hover:bg-neon-red/20"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0f1629] border-l border-white/10 z-50 shadow-2xl p-6 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-lg font-black text-white">{selectedUser.name}</h2>
                  <p className="text-xs text-gray-400">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FaSpinner className="text-neon-blue text-2xl animate-spin mb-2" />
                  <p className="text-xs text-gray-400">Loading user profile & history...</p>
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  {/* Account Summary Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Role</span>
                      <p className="text-sm font-black text-white mt-0.5">{userDetails?.role}</p>
                    </div>
                    <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Status</span>
                      <p className="text-sm font-black text-neon-green mt-0.5">{userDetails?.accountStatus}</p>
                    </div>
                    <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Total Bookings</span>
                      <p className="text-sm font-black text-neon-blue mt-0.5">{userDetails?.totalBookings}</p>
                    </div>
                    <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Lifetime Spend</span>
                      <p className="text-sm font-black text-neon-green mt-0.5">{fmtMoney(userDetails?.totalSpent)}</p>
                    </div>
                  </div>

                  {/* Penalty Status */}
                  {userDetails?.outstanding > 0 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="font-bold text-neon-red text-xs">Unpaid Penalty</p>
                      <p className="text-xl font-black text-white mt-1">{fmtMoney(userDetails.outstanding)}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Warning count: {userDetails.warningCount} / 5
                      </p>
                    </div>
                  )}

                  {/* Recent Bookings List */}
                  <div>
                    <h3 className="font-bold text-white text-xs mb-3 flex items-center gap-1.5">
                      <FaCar className="text-neon-blue" /> Recent Bookings
                    </h3>
                    <div className="space-y-2">
                      {userDetails?.recentBookings?.length === 0 ? (
                        <p className="text-gray-500 py-3">No bookings yet.</p>
                      ) : (
                        userDetails?.recentBookings?.map((b) => (
                          <div key={b.id} className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-white">{b.parkingName} [{b.slotCode}]</p>
                              <p className="text-[10px] text-gray-500">{fmtDate(b.createdAt)} • {b.vehicleNumber}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-neon-green">{fmtMoney(b.amount)}</span>
                              <p className="text-[9px] text-gray-400 uppercase">{b.status}</p>
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
