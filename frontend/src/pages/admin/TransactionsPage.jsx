import { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaSearch, FaTimes, FaSyncAlt,
  FaExclamationTriangle
} from "react-icons/fa";
import { api } from "../../api/api";
import { TableSkeleton } from "../../components/common/Skeleton";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/transactions");
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
      toast.error(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        !search ||
        t.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
        t.userName?.toLowerCase().includes(search.toLowerCase()) ||
        t.parkingName?.toLowerCase().includes(search.toLowerCase());

      const matchMethod = methodFilter === "ALL" || t.method === methodFilter;
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;

      return matchSearch && matchMethod && matchStatus;
    });
  }, [transactions, search, methodFilter, statusFilter]);

  const fmtMoney = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const fmtTime = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <DashboardLayout role="ADMIN">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Payment Transactions</h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete transaction ledger of booking payments, extensions, and penalty receipts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
            Total Transactions: <strong className="text-white">{transactions.length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-black/20 border border-white/10 rounded-xl px-3 py-2 w-full md:w-80">
          <FaSearch className="text-gray-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by Transaction ID, User, or Lot..."
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

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="WALLET">Wallet</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Table Content with Skeleton */}
      {loading ? (
        <TableSkeleton rows={7} cols={7} />
      ) : error ? (
        <div className="bg-[#1e293b] border border-neon-red/30 rounded-2xl p-12 text-center text-gray-300 flex flex-col items-center gap-3">
          <FaExclamationTriangle className="text-neon-red text-3xl" />
          <p className="text-sm font-bold text-white">Unable to load transactions</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No transactions found.
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Parking Facility</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-bold text-gray-300">
                      {t.transactionId}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{t.userName}</p>
                      <p className="text-[11px] text-gray-400">{t.userEmail}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">{t.parkingName}</p>
                      {t.slotCode && <span className="text-[10px] text-neon-blue">Slot {t.slotCode}</span>}
                    </td>

                    <td className="p-4 text-gray-300 font-semibold">
                      {t.method || "UPI"}
                    </td>

                    <td className="p-4 font-black text-neon-green">
                      {fmtMoney(t.amount)}
                    </td>

                    <td className="p-4 text-[11px] text-gray-400">
                      {fmtTime(t.paidAt || t.createdAt)}
                    </td>

                    <td className="p-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          t.status === "SUCCESS"
                            ? "bg-neon-green/20 text-neon-green border-neon-green/30"
                            : t.status === "FAILED"
                            ? "bg-neon-red/20 text-neon-red border-neon-red/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
