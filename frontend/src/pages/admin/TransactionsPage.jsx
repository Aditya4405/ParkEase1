import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Payment Transactions</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60">
              {transactions.length} records
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete transaction ledger of booking payments, extensions, and settlements
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-fit"
        >
          <FaSyncAlt size={11} className={loading ? "animate-spin text-primary-600" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="parkease-card rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by Transaction ID, User, or Lot..."
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

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="parkease-input py-2 px-3 text-xs cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="WALLET">Wallet</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="parkease-input py-2 px-3 text-xs cursor-pointer"
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
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-600 dark:text-slate-300 flex flex-col items-center gap-3 border-rose-200 dark:border-rose-900/40">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Unable to load transactions</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-400 text-xs">
          No transactions found.
        </div>
      ) : (
        <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                      {t.transactionId}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{t.userName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.userEmail}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{t.parkingName}</p>
                      {t.slotCode && <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold">Slot {t.slotCode}</span>}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {t.method || "UPI"}
                    </td>

                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {fmtMoney(t.amount)}
                    </td>

                    <td className="p-4 text-[11px] text-slate-500 dark:text-slate-400">
                      {fmtTime(t.paidAt || t.createdAt)}
                    </td>

                    <td className="p-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === "SUCCESS"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                            : t.status === "FAILED"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
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
