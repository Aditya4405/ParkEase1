import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaSearch, FaTimes, FaSyncAlt
} from "react-icons/fa";
import { api } from "../../api/api";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/audit-logs");
      setLogs(data || []);
    } catch (err) {
      setError(err.message || "Failed to load audit trail");
      toast.error(err.message || "Failed to load audit trail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        !search ||
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.adminName?.toLowerCase().includes(search.toLowerCase()) ||
        l.description?.toLowerCase().includes(search.toLowerCase()) ||
        l.targetType?.toLowerCase().includes(search.toLowerCase());

      const matchAction = actionFilter === "ALL" || l.action.includes(actionFilter);

      return matchSearch && matchAction;
    });
  }, [logs, search, actionFilter]);

  const fmtTime = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Administrative Audit Trail</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable record of all administrator interventions, account status updates, and facility modifications
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-fit"
        >
          <FaSyncAlt size={11} className={loading ? "animate-spin text-primary-600" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400 mb-6 flex flex-col items-center gap-3">
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Loading Logs
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="parkease-card rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search audit descriptions, admin, target..."
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

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="parkease-input py-2 px-3 text-xs cursor-pointer"
        >
          <option value="ALL">All Actions</option>
          <option value="USER">User Status Changes</option>
          <option value="PARKING">Parking Modifications</option>
          <option value="REFUND">Refund Approvals</option>
          <option value="SLOT">Slot & Ghost Actions</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="parkease-card rounded-2xl p-6 space-y-4 animate-pulse shadow-sm">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-850 rounded"></div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-400 text-xs shadow-sm">
          No administrative actions recorded matching filters.
        </div>
      ) : (
        <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Action Code</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Audit Description</th>
                  <th className="p-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      {fmtTime(l.createdAt)}
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {l.adminName || "Super Admin"}
                    </td>

                    <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                      {l.action}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{l.targetType}</span>
                      {l.targetId && <span className="text-slate-400 text-[10px] ml-1">#{l.targetId}</span>}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300 max-w-sm">
                      {l.description}
                    </td>

                    <td className="p-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        {l.status || "SUCCESS"}
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
