import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaArrowLeft, FaCar, FaMotorcycle, FaTruck, FaCarSide,
  FaEdit, FaTimes, FaSave, FaBan, FaCheck, FaPlus, FaSpinner,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { ownerParkingsAPI, ownerSlotsAPI } from "../../api/api";

const STATUSES = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"];

const vehicleIcon = (type) => {
  switch (type) {
    case "CAR":   return <FaCar />;
    case "BIKE":  return <FaMotorcycle />;
    case "LARGE": return <FaTruck />;
    case "SMALL": return <FaCarSide />;
    default:      return <FaCar />;
  }
};

const getStatusColor = (status, disabled) => {
  if (disabled) return "bg-gray-800/50 border-gray-700 text-gray-600";
  switch (status) {
    case "AVAILABLE":   return "bg-neon-green/10 border-neon-green/30 text-neon-green";
    case "OCCUPIED":    return "bg-neon-red/10 border-neon-red/30 text-neon-red";
    case "RESERVED":    return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500";
    case "MAINTENANCE": return "bg-gray-500/10 border-gray-500/30 text-gray-400";
    default:            return "bg-white/5 border-white/10 text-gray-400";
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "AVAILABLE":   return "bg-neon-green/20 text-neon-green border-neon-green/30";
    case "OCCUPIED":    return "bg-neon-red/20 text-neon-red border-neon-red/30";
    case "RESERVED":    return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    case "MAINTENANCE": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:            return "bg-white/10 text-gray-400 border-white/10";
  }
};

export default function ManageParkingSlots() {
  const navigate    = useNavigate();
  const { parkingId } = useParams();

  const [parking,      setParking]      = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editingSlot,  setEditingSlot]  = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [filterType,   setFilterType]   = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlotData,  setNewSlotData]  = useState({
    vehicleType: "CAR",
    costPerHour: 50,
  });
  const [addingSlot, setAddingSlot] = useState(false);

  // ── Load parking + slots from backend ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await ownerParkingsAPI.getById(parkingId);
        setParking(data);
        setSlots(data.slots || []);
      } catch (err) {
        toast.error("Failed to load parking: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [parkingId]);

  // ── Change status ───────────────────────────────────────────────────────────
  const handleStatusChange = async (slotId, newStatus) => {
    try {
      const updated = await ownerSlotsAPI.updateStatus(slotId, { status: newStatus });
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: updated.status } : s));
      if (selectedSlot?.id === slotId)
        setSelectedSlot(prev => ({ ...prev, status: updated.status }));
      toast.success(`Slot status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  // ── Toggle enable / disable ────────────────────────────────────────────────
  const handleToggleDisable = async (slotId) => {
    try {
      const updated = await ownerSlotsAPI.toggle(slotId);
      setSlots(prev => prev.map(s =>
        s.id === slotId ? { ...s, disabled: updated.disabled, status: updated.status } : s
      ));
      if (selectedSlot?.id === slotId)
        setSelectedSlot(prev => ({ ...prev, disabled: updated.disabled, status: updated.status }));
      toast.success(updated.disabled ? "Slot disabled." : "Slot enabled.");
    } catch (err) {
      toast.error(err.message || "Failed to toggle slot.");
    }
  };

  // ── Save price edit ────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editingSlot) return;
    setSaving(true);
    try {
      const updated = await ownerSlotsAPI.updatePrice(editingSlot.id, {
        costPerHour: editingSlot.costPerHour,
      });
      setSlots(prev => prev.map(s =>
        s.id === editingSlot.id ? { ...s, costPerHour: updated.costPerHour } : s
      ));
      setSelectedSlot(prev => ({ ...prev, costPerHour: updated.costPerHour }));
      setEditingSlot(null);
      toast.success("Price updated.");
    } catch (err) {
      toast.error(err.message || "Failed to save price.");
    } finally {
      setSaving(false);
    }
  };

  // ── Add new slot ───────────────────────────────────────────────────────────
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setAddingSlot(true);
    try {
      const created = await ownerParkingsAPI.addSlot(parkingId, {
        vehicleType: newSlotData.vehicleType,
        costPerHour: Number(newSlotData.costPerHour),
      });
      setSlots(prev => [...prev, created]);
      setShowAddModal(false);
      setNewSlotData({ vehicleType: "CAR", costPerHour: 50 });
      toast.success(`Slot ${created.slotCode} added.`);
    } catch (err) {
      toast.error(err.message || "Failed to add slot.");
    } finally {
      setAddingSlot(false);
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const vehicleTypes  = [...new Set(slots.map(s => s.vehicleType))];
  const filteredSlots = slots.filter(s => {
    const matchType   = filterType   === "ALL" || s.vehicleType === filterType;
    const matchStatus = filterStatus === "ALL" || s.status      === filterStatus;
    return matchType && matchStatus;
  });

  // ── Loading / not found ────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout role="OWNER">
        <div className="flex items-center justify-center py-32">
          <FaSpinner className="text-neon-blue text-4xl animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!parking) {
    return (
      <DashboardLayout role="OWNER">
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-gray-400 text-lg mb-4">Parking lot not found.</p>
          <button
            onClick={() => navigate("/owner/dashboard")}
            className="px-6 py-3 bg-neon-blue hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout role="OWNER">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/owner/dashboard")}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white">{parking.name}</h2>
              <p className="text-gray-400 text-sm mt-1">
                {slots.length} slots · {slots.filter(s => s.status === "AVAILABLE" && !s.disabled).length} available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Vehicle type filter */}
            <div className="flex gap-1 bg-dark-card border border-white/10 rounded-lg p-1">
              {["ALL", ...vehicleTypes].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    filterType === t ? "bg-neon-blue text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-dark-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-neon-blue"
            >
              <option value="ALL">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-neon-blue hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2 text-sm"
            >
              <FaPlus /> Add Slot
            </button>
          </div>
        </div>

        {/* ── Legend ──────────────────────────────────────────────────────── */}
        <div className="flex gap-4 mb-6 text-xs text-gray-400">
          {[
            { label: "Available",   color: "bg-neon-green" },
            { label: "Occupied",    color: "bg-neon-red" },
            { label: "Reserved",    color: "bg-yellow-500" },
            { label: "Maintenance", color: "bg-gray-500" },
            { label: "Disabled",    color: "bg-gray-800 border border-gray-700" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${color}`} />
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-6 relative">

          {/* ── Slot Grid ─────────────────────────────────────────────────── */}
          <div className="flex-1">
            <div className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              {filteredSlots.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No slots match your filters.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filteredSlots.map(slot => (
                    <motion.div
                      key={slot.id}
                      whileHover={!slot.disabled ? { scale: 1.06, y: -3 } : {}}
                      onClick={() => { setSelectedSlot(slot); setEditingSlot(null); }}
                      className={`relative h-24 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all
                        ${getStatusColor(slot.status, slot.disabled)}
                        ${selectedSlot?.id === slot.id ? "ring-2 ring-white scale-105 z-10" : ""}
                      `}
                    >
                      <div className="text-lg mb-0.5">{vehicleIcon(slot.vehicleType)}</div>
                      <span className="text-[11px] font-mono font-black">{slot.slotCode}</span>
                      <div className="absolute bottom-1.5 text-[9px] uppercase tracking-wider opacity-70">
                        {slot.disabled ? "OFF" : slot.status?.slice(0, 4)}
                      </div>
                      {slot.costPerHour && (
                        <div className="absolute top-1 right-1 text-[9px] opacity-60">
                          ₹{slot.costPerHour}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Detail Panel ──────────────────────────────────────────────── */}
          <AnimatePresence>
            {selectedSlot && (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="w-72 shrink-0 sticky top-24 h-fit"
              >
                <div className="bg-dark-card border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                  <button
                    onClick={() => { setSelectedSlot(null); setEditingSlot(null); }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes />
                  </button>

                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 ${getStatusColor(selectedSlot.status, selectedSlot.disabled)}`}>
                    {vehicleIcon(selectedSlot.vehicleType)}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-1 font-mono">{selectedSlot.slotCode}</h3>
                  <span className={`px-3 py-1 rounded text-xs font-bold border ${getStatusBadgeColor(selectedSlot.status)}`}>
                    {selectedSlot.disabled ? "DISABLED" : selectedSlot.status}
                  </span>

                  <div className="mt-5 space-y-3">
                    {/* Vehicle type */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-gray-400 text-xs uppercase">Vehicle Type</p>
                      <p className="text-white font-bold">{selectedSlot.vehicleTypeLabel || selectedSlot.vehicleType}</p>
                    </div>

                    {/* Price — editable */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-gray-400 text-xs uppercase mb-1">Price / hr</p>
                      {editingSlot ? (
                        <input
                          type="number" min="0.5" step="0.5"
                          value={editingSlot.costPerHour}
                          onChange={e => setEditingSlot({ ...editingSlot, costPerHour: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-dark-bg border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-blue"
                        />
                      ) : (
                        <p className="text-neon-green font-bold text-lg">₹{selectedSlot.costPerHour}/hr</p>
                      )}
                    </div>

                    {/* Status buttons — only when enabled */}
                    {!selectedSlot.disabled && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-gray-400 text-xs uppercase mb-2">Change Status</p>
                        <div className="grid grid-cols-2 gap-2">
                          {STATUSES.map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(selectedSlot.id, status)}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                selectedSlot.status === status
                                  ? getStatusBadgeColor(status) + " ring-1 ring-white/20"
                                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {editingSlot ? (
                      <>
                        <button
                          onClick={() => setEditingSlot(null)}
                          disabled={saving}
                          className="py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FaTimes /> Cancel
                        </button>
                        <button
                          onClick={handleEditSave}
                          disabled={saving}
                          className="py-2.5 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/30 transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingSlot({ ...selectedSlot })}
                          className="py-2.5 rounded-lg bg-white/5 hover:bg-neon-blue/20 text-white border border-white/10 hover:border-neon-blue/50 transition-all text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <FaEdit /> Edit Price
                        </button>
                        <button
                          onClick={() => handleToggleDisable(selectedSlot.id)}
                          className={`py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                            selectedSlot.disabled
                              ? "bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border-neon-green/20"
                              : "bg-neon-red/10 hover:bg-neon-red/20 text-neon-red border-neon-red/20"
                          }`}
                        >
                          {selectedSlot.disabled ? <><FaCheck /> Enable</> : <><FaBan /> Disable</>}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Add Slot Modal ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-card border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Add New Slot</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5 uppercase tracking-wider font-bold">Vehicle Type</label>
                    <select
                      value={newSlotData.vehicleType}
                      onChange={e => setNewSlotData({ ...newSlotData, vehicleType: e.target.value })}
                      className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                    >
                      <option value="CAR">Car</option>
                      <option value="BIKE">Bike</option>
                      <option value="LARGE">Large</option>
                      <option value="SMALL">Small</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5 uppercase tracking-wider font-bold">Price / hr (₹)</label>
                    <input
                      type="number" min="1" step="0.5"
                      value={newSlotData.costPerHour}
                      onChange={e => setNewSlotData({ ...newSlotData, costPerHour: e.target.value })}
                      required
                      className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                    />
                  </div>

                  <p className="text-gray-500 text-xs">
                    Slot code will be auto-generated by the server (e.g. CAR-05).
                  </p>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={addingSlot}
                      className="w-full py-4 rounded-xl bg-neon-green hover:bg-green-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] text-lg flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {addingSlot
                        ? <><FaSpinner className="animate-spin" /> Adding...</>
                        : <><FaPlus /> Save Slot</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </DashboardLayout>
    </>
  );
}