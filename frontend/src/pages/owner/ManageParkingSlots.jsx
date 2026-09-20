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
  if (disabled) return "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 border-dashed opacity-60";
  switch (status) {
    case "AVAILABLE":   return "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400 hover:border-primary-500 shadow-xs";
    case "OCCUPIED":    return "bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-80";
    case "RESERVED":    return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400";
    case "MAINTENANCE": return "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400";
    default:            return "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500";
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "AVAILABLE":   return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60";
    case "OCCUPIED":    return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60";
    case "RESERVED":    return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60";
    case "MAINTENANCE": return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    default:            return "bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200";
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
          <FaSpinner className="text-primary-600 text-3xl animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!parking) {
    return (
      <DashboardLayout role="OWNER">
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-slate-500 dark:text-slate-400 text-base mb-4">Facility not located.</p>
          <button
            onClick={() => navigate("/owner/dashboard")}
            className="parkease-btn-primary py-2.5 px-5 text-sm font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout role="OWNER">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/owner/dashboard")}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{parking.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                {slots.length} total slots registered · {slots.filter(s => s.status === "AVAILABLE" && !s.disabled).length} immediately available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Vehicle type filter */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              {["ALL", ...vehicleTypes].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterType === t 
                      ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-white font-bold shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
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
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none focus:border-primary-500 shadow-sm"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="parkease-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <FaPlus size={10} /> Add Slot
            </button>
          </div>
        </div>

        {/* ── Legend ──────────────────────────────────────────────────────── */}
        <div className="flex gap-4 mb-6 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          {[
            { label: "Available",   color: "bg-primary-600" },
            { label: "Occupied",    color: "bg-slate-400 dark:bg-slate-600" },
            { label: "Reserved",    color: "bg-amber-500" },
            { label: "Maintenance", color: "bg-slate-300 dark:bg-slate-700" },
            { label: "Disabled",    color: "border border-dashed border-slate-400" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${color}`} />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 relative items-start">

          {/* ── Slot Grid ─────────────────────────────────────────────────── */}
          <div className="flex-1 w-full">
            <div className="parkease-card rounded-2xl p-6 shadow-sm">
              {filteredSlots.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-12 text-sm">No slots match your selected filters.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filteredSlots.map(slot => (
                    <motion.div
                      key={slot.id}
                      whileHover={!slot.disabled ? { scale: 1.04, y: -2 } : {}}
                      onClick={() => { setSelectedSlot(slot); setEditingSlot(null); }}
                      className={`relative h-24 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all
                        ${getStatusColor(slot.status, slot.disabled)}
                        ${selectedSlot?.id === slot.id ? "ring-2 ring-primary-600 shadow-md scale-105 z-10" : ""}
                      `}
                    >
                      <div className="text-lg mb-0.5">{vehicleIcon(slot.vehicleType)}</div>
                      <span className="text-xs font-mono font-bold">{slot.slotCode}</span>
                      <div className="absolute bottom-1 text-[9px] uppercase tracking-wider font-semibold opacity-75">
                        {slot.disabled ? "OFF" : slot.status?.slice(0, 4)}
                      </div>
                      {slot.costPerHour && (
                        <div className="absolute top-1 right-1.5 text-[9px] font-bold opacity-60">
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
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0 }}
                className="w-full lg:w-80 shrink-0 sticky top-24"
              >
                <div className="parkease-card rounded-2xl p-6 shadow-xl relative border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => { setSelectedSlot(null); setEditingSlot(null); }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 border ${getStatusColor(selectedSlot.status, selectedSlot.disabled)}`}>
                    {vehicleIcon(selectedSlot.vehicleType)}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-mono">{selectedSlot.slotCode}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeColor(selectedSlot.status)}`}>
                    {selectedSlot.disabled ? "DISABLED" : selectedSlot.status}
                  </span>

                  <div className="mt-5 space-y-3">
                    {/* Vehicle type */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Vehicle Class</p>
                      <p className="text-slate-900 dark:text-white font-bold text-sm mt-0.5">{selectedSlot.vehicleTypeLabel || selectedSlot.vehicleType}</p>
                    </div>

                    {/* Price — editable */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Hourly Rate</p>
                      {editingSlot ? (
                        <input
                          type="number" min="0.5" step="0.5"
                          value={editingSlot.costPerHour}
                          onChange={e => setEditingSlot({ ...editingSlot, costPerHour: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary-500"
                        />
                      ) : (
                        <p className="text-primary-600 dark:text-primary-400 font-bold text-base">₹{selectedSlot.costPerHour}/hr</p>
                      )}
                    </div>

                    {/* Status buttons */}
                    {!selectedSlot.disabled && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Override Status</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {STATUSES.map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(selectedSlot.id, status)}
                              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                selectedSlot.status === status
                                  ? getStatusBadgeColor(status) + " ring-1 ring-primary-500/30"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
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
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {editingSlot ? (
                      <>
                        <button
                          onClick={() => setEditingSlot(null)}
                          disabled={saving}
                          className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <FaTimes size={10} /> Cancel
                        </button>
                        <button
                          onClick={handleEditSave}
                          disabled={saving}
                          className="py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                        >
                          {saving ? <FaSpinner className="animate-spin" size={10} /> : <FaSave size={10} />} Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingSlot({ ...selectedSlot })}
                          className="py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <FaEdit size={10} className="text-primary-600" /> Edit Rate
                        </button>
                        <button
                          onClick={() => handleToggleDisable(selectedSlot.id)}
                          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border shadow-sm ${
                            selectedSlot.disabled
                              ? "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                              : "bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                          }`}
                        >
                          {selectedSlot.disabled ? <><FaCheck size={10} /> Enable</> : <><FaBan size={10} /> Disable</>}
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
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 w-full max-w-md shadow-2xl"
              >
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Parking Slot</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Vehicle Classification</label>
                    <select
                      value={newSlotData.vehicleType}
                      onChange={e => setNewSlotData({ ...newSlotData, vehicleType: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                    >
                      <option value="CAR">Standard Car</option>
                      <option value="BIKE">Two-Wheeler</option>
                      <option value="LARGE">SUV / Large</option>
                      <option value="SMALL">Compact / Mini</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Price / Hour (₹)</label>
                    <input
                      type="number" min="1" step="1"
                      value={newSlotData.costPerHour}
                      onChange={e => setNewSlotData({ ...newSlotData, costPerHour: e.target.value })}
                      required
                      className="parkease-input text-sm"
                    />
                  </div>

                  <p className="text-slate-400 text-xs">
                    Slot identifier is automatically assigned in sequence according to the vehicle prefix (e.g. CAR-12).
                  </p>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={addingSlot}
                      className="w-full py-3 rounded-xl parkease-btn-primary font-bold transition-all shadow-sm text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {addingSlot
                        ? <><FaSpinner className="animate-spin" size={12} /> Registering Slot...</>
                        : <><FaPlus size={12} /> Confirm & Add Slot</>}
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