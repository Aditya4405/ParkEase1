import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaTimes, FaPlus,
  FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";
import { api } from "../../api/api";

export default function MaintenancePage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [parkings, setParkings] = useState([]);

  // Form states
  const [selectedParkingId, setSelectedParkingId] = useState("");
  const [issueText, setIssueText] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/maintenance");
      setIssues(data || []);
    } catch (err) {
      setError(err.message || "Failed to load maintenance issues");
      toast.error(err.message || "Failed to load maintenance issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchParkings = async () => {
    try {
      const data = await api.get("/admin/parkings");
      setParkings(data || []);
      if (data?.length > 0) setSelectedParkingId(String(data[0].id));
    } catch (err) {}
  };

  useEffect(() => {
    fetchIssues();
    fetchParkings();
  }, []);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!selectedParkingId || !issueText.trim()) {
      toast.warn("Please enter a description and select a facility.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/maintenance", {
        parkingId: selectedParkingId,
        issue: issueText,
        priority: priority
      });
      toast.success("Maintenance ticket dispatched!");
      setShowCreateModal(false);
      setIssueText("");
      fetchIssues();
    } catch (err) {
      toast.error(err.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (issueId, nextStatus) => {
    try {
      await api.patch(`/admin/maintenance/${issueId}/status`, { status: nextStatus });
      toast.success(`Ticket status updated to ${nextStatus}`);
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: nextStatus } : i))
      );
    } catch (err) {
      toast.error(err.message || "Failed to update ticket status");
    }
  };

  const fmtTime = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <DashboardLayout role="ADMIN">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Facility Maintenance & Repairs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch repair tasks, track slot inspections, and resolve hardware or barrier faults
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="parkease-btn-primary flex items-center gap-2 py-2 px-4 text-xs cursor-pointer w-fit"
        >
          <FaPlus size={11} />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400 mb-6 flex flex-col items-center gap-3">
          <FaExclamationTriangle size={24} className="text-rose-500" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchIssues}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Loading Issues
          </button>
        </div>
      )}

      {/* Issues Table */}
      {loading ? (
        <div className="parkease-card rounded-2xl p-6 space-y-4 animate-pulse shadow-sm">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-850 rounded"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="parkease-card rounded-2xl p-16 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-2xl">
            <FaCheckCircle />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">All Facilities Operational</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No open repair tickets or reported slot faults.
          </p>
        </div>
      ) : (
        <div className="parkease-card rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Parking Facility</th>
                  <th className="p-4">Slot</th>
                  <th className="p-4">Issue Description</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Reported By</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {issues.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                      #{i.id}
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {i.parkingName}
                    </td>

                    <td className="p-4 font-mono text-primary-600 dark:text-primary-400">
                      {i.slotCode || "Facility Wide"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 max-w-xs">
                      {i.issue}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          i.priority === "CRITICAL"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                            : i.priority === "HIGH"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
                        }`}
                      >
                        {i.priority}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {i.reportedBy || "Admin"}
                    </td>

                    <td className="p-4 text-[11px] text-slate-400 dark:text-slate-500">
                      {fmtTime(i.createdAt)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          i.status === "RESOLVED"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                            : i.status === "IN_PROGRESS"
                            ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800/60"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {i.status !== "RESOLVED" && (
                        <div className="flex items-center justify-end gap-1.5">
                          {i.status === "OPEN" && (
                            <button
                              onClick={() => handleUpdateStatus(i.id, "IN_PROGRESS")}
                              className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60 font-bold hover:bg-primary-100 transition-all text-xs cursor-pointer"
                            >
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(i.id, "RESOLVED")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-bold hover:bg-emerald-100 transition-all text-xs cursor-pointer"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Maintenance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Maintenance Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer">
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Parking Facility</label>
                <select
                  value={selectedParkingId}
                  onChange={(e) => setSelectedParkingId(e.target.value)}
                  className="parkease-input py-2 px-3 text-xs w-full cursor-pointer"
                >
                  {parkings.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="parkease-input py-2 px-3 text-xs w-full cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Issue Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the physical problem (e.g., sensor malfunction, gate barrier stuck, oil spill)..."
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  className="parkease-input p-3 text-xs w-full resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="parkease-btn-primary flex-1 py-2.5 text-xs cursor-pointer"
                >
                  {submitting ? "Dispatching..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
