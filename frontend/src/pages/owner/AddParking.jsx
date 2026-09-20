import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaPlus, FaTrash, FaArrowLeft, FaParking, FaSpinner, FaCar } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { ownerParkingsAPI } from "../../api/api";

const VEHICLE_TYPES = [
  { value: "CAR",   label: "Standard Car",   prefix: "CAR"  },
  { value: "BIKE",  label: "Two-Wheeler",    prefix: "BIKE" },
  { value: "LARGE", label: "SUV / Large",    prefix: "LRG"  },
  { value: "SMALL", label: "Compact / Mini", prefix: "SML"  },
];

export default function AddParking() {
  const navigate = useNavigate();

  const [parkingName,  setParkingName]  = useState("");
  const [location,     setLocation]     = useState("");
  const [description,  setDescription]  = useState("");
  const [slotConfigs,  setSlotConfigs]  = useState([
    { vehicleType: "CAR", numberOfSlots: "", costPerHour: "" },
  ]);
  const [loading, setLoading] = useState(false);

  // ── Slot config helpers ────────────────────────────────────────────────────
  const addSlotConfig = () => {
    const usedTypes = slotConfigs.map(c => c.vehicleType);
    const available = VEHICLE_TYPES.find(t => !usedTypes.includes(t.value));
    if (!available) return;
    setSlotConfigs([...slotConfigs, { vehicleType: available.value, numberOfSlots: "", costPerHour: "" }]);
  };

  const removeSlotConfig = (index) => {
    if (slotConfigs.length === 1) return;
    setSlotConfigs(slotConfigs.filter((_, i) => i !== index));
  };

  const updateSlotConfig = (index, field, value) => {
    const updated = [...slotConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setSlotConfigs(updated);
  };

  const generatePreview = () => {
    const slots = [];
    slotConfigs.forEach(config => {
      const count    = parseInt(config.numberOfSlots) || 0;
      const typeInfo = VEHICLE_TYPES.find(t => t.value === config.vehicleType) || { prefix: "SLT" };
      for (let i = 1; i <= count; i++) {
        slots.push(`${typeInfo.prefix}-${String(i).padStart(2, "0")}`);
      }
    });
    return slots;
  };

  // ── Submit to backend ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validConfigs = slotConfigs.filter(
      c => parseInt(c.numberOfSlots) > 0 && parseFloat(c.costPerHour) > 0
    );
    if (validConfigs.length === 0) {
      toast.error("Add at least one slot category with positive slots and cost.");
      return;
    }

    setLoading(true);
    try {
      await ownerParkingsAPI.create({
        name:        parkingName.trim(),
        location:    location.trim(),
        description: description.trim(),
        slotConfigs: validConfigs.map(c => ({
          vehicleType:   c.vehicleType,
          numberOfSlots: parseInt(c.numberOfSlots),
          costPerHour:   parseFloat(c.costPerHour),
        })),
      });

      toast.success("Parking facility registered successfully!");
      setTimeout(() => navigate("/owner/dashboard"), 1000);
    } catch (err) {
      toast.error(err.message || "Failed to create parking.");
      setLoading(false);
    }
  };

  const preview = generatePreview();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout role="OWNER">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/owner/dashboard")}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Add Parking Facility</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Configure your facility details, vehicle slot categories, and pricing</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Basic Details ─────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="parkease-card rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <FaParking className="text-primary-600 dark:text-primary-400" /> Facility Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Facility Name *</label>
                  <input
                    type="text"
                    value={parkingName}
                    onChange={e => setParkingName(e.target.value)}
                    placeholder="e.g. City Center Mall Parking"
                    required
                    className="parkease-input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Full Location Address *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Near Metro Gate 2, Connaught Place, New Delhi"
                    required
                    className="parkease-input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Description & Amenities</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide details such as CCTV monitoring, EV charging, covered roof, 24/7 security..."
                    rows={3}
                    className="parkease-input text-sm resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* ── Slot Configuration ────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="parkease-card rounded-2xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaCar className="text-primary-600 dark:text-primary-400" /> Slot Breakdown & Rates
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Specify slots and hourly prices per vehicle type</p>
                </div>
                {slotConfigs.length < VEHICLE_TYPES.length && (
                  <button
                    type="button"
                    onClick={addSlotConfig}
                    className="px-3.5 py-1.5 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 text-primary-700 dark:text-primary-300 border border-primary-200/70 dark:border-primary-800/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <FaPlus size={10} /> Add Category
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {slotConfigs.map((config, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 rounded-xl p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Vehicle Category</label>
                        <select
                          value={config.vehicleType}
                          onChange={e => updateSlotConfig(index, "vehicleType", e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                        >
                          {VEHICLE_TYPES.map(t => (
                            <option
                              key={t.value}
                              value={t.value}
                              disabled={slotConfigs.some((c, i) => i !== index && c.vehicleType === t.value)}
                            >
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Slot Count</label>
                        <input
                          type="number" min="1" max="250"
                          value={config.numberOfSlots}
                          onChange={e => updateSlotConfig(index, "numberOfSlots", e.target.value)}
                          placeholder="e.g. 15"
                          required
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Fare / Hour (₹)</label>
                        <input
                          type="number" min="1" step="1"
                          value={config.costPerHour}
                          onChange={e => updateSlotConfig(index, "costPerHour", e.target.value)}
                          placeholder="e.g. 40"
                          required
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        {slotConfigs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlotConfig(index)}
                            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-all text-xs"
                            title="Remove Category"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Slot Preview */}
              {preview.length > 0 && (
                <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">Auto-Generated Slot Identifiers</p>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {preview.map(code => (
                      <span key={code}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-300 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono font-bold shadow-xs">
                        {code}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 font-medium">
                    Total: <span className="font-bold text-slate-900 dark:text-white">{preview.length}</span> parking slots will be registered.
                  </p>
                </div>
              )}
            </motion.div>

            {/* ── Submit ────────────────────────────────────────────────────── */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/owner/dashboard")}
                className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 transition-all shadow-sm text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl parkease-btn-primary font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
              >
                {loading
                  ? <><FaSpinner className="animate-spin" /> Registering Facility...</>
                  : <><FaPlus size={12} /> Register Facility</>}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </>
  );
}