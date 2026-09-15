import { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaClipboardList, FaSearch, FaTimes, FaSpinner,
  FaShieldAlt, FaUserCheck, FaBan, FaWrench, FaUndo
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Administrative Audit Trail</h1>
          <p className="text-xs text-gray-400 mt-1">
            Immutable record of all administrator interventions, account status updates, and facility modifications
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400 mb-6 flex flex-col items-center gap-3">
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Loading Logs
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2.5 bg-black/20 border border-white/10 rounded-xl px-3 py-2 w-full md:w-80">
          <FaSearch className="text-gray-400 text-xs flex-shrink-0" />
          <input
            type="text"
            placeholder="Search audit descriptions, admin, target..."
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

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
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
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded"></div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-xs">
          No administrative actions recorded matching filters.
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Action Code</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Audit Description</th>
                  <th className="p-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-[11px] text-gray-400 font-mono">
                      {fmtTime(l.createdAt)}
                    </td>

                    <td className="p-4 font-bold text-white">
                      {l.adminName || "Super Admin"}
                    </td>

                    <td className="p-4 font-mono font-bold text-neon-blue">
                      {l.action}
                    </td>

                    <td className="p-4 text-gray-300">
                      <span className="font-semibold">{l.targetType}</span>
                      {l.targetId && <span className="text-gray-500 text-[10px] ml-1">#{l.targetId}</span>}
                    </td>

                    <td className="p-4 text-gray-300 max-w-sm">
                      {l.description}
                    </td>

                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-neon-green/20 text-neon-green border border-neon-green/30">
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
