import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Facility Maintenance & Repairs</h1>
          <p className="text-xs text-gray-400 mt-1">
            Dispatch repair tasks, track slot inspections, and resolve hardware or pavement faults
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-blue to-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all cursor-pointer"
        >
          <FaPlus size={11} />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400 mb-6 flex flex-col items-center gap-3">
          <FaExclamationTriangle size={24} className="text-red-400" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchIssues}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Retry Loading Issues
          </button>
        </div>
      )}

      {/* Issues Table */}
      {loading ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-neon-green/20 text-neon-green mx-auto flex items-center justify-center text-2xl">
            <FaCheckCircle />
          </div>
          <h2 className="text-base font-black text-white">All Facilities Operational</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            No open repair tickets or reported slot faults.
          </p>
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-white/5">
                {issues.map((i) => (
                  <tr key={i.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-bold text-gray-300">
                      #{i.id}
                    </td>

                    <td className="p-4 font-bold text-white">
                      {i.parkingName}
                    </td>

                    <td className="p-4 font-mono text-neon-blue">
                      {i.slotCode || "Facility Wide"}
                    </td>

                    <td className="p-4 text-gray-300 max-w-xs">
                      {i.issue}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          i.priority === "CRITICAL"
                            ? "bg-neon-red/20 text-neon-red border-neon-red/30"
                            : i.priority === "HIGH"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {i.priority}
                      </span>
                    </td>

                    <td className="p-4 text-gray-400">
                      {i.reportedBy || "Admin"}
                    </td>

                    <td className="p-4 text-[11px] text-gray-500">
                      {fmtTime(i.createdAt)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          i.status === "RESOLVED"
                            ? "bg-neon-green/20 text-neon-green border-neon-green/30"
                            : i.status === "IN_PROGRESS"
                            ? "bg-neon-blue/20 text-neon-blue border-neon-blue/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
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
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold hover:bg-blue-500/20 transition-all text-xs"
                            >
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(i.id, "RESOLVED")}
                            className="px-2.5 py-1 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/30 font-bold hover:bg-neon-green/20 transition-all text-xs"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-black text-white">Create Maintenance Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-white">
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Parking Facility</label>
                <select
                  value={selectedParkingId}
                  onChange={(e) => setSelectedParkingId(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                >
                  {parkings.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Issue Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the physical problem (e.g., sensor malfunction, gate barrier stuck, oil spill)..."
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none placeholder-gray-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-neon-blue hover:bg-blue-600 text-white font-bold transition-colors shadow-lg shadow-blue-500/20"
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
