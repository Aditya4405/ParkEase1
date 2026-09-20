import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import { FaBuilding, FaPlus, FaCar, FaMoneyBillWave, FaClock, FaEdit, FaEye, FaSpinner, FaArrowLeft, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import StatCard from "../../components/dashboard/StatCard";
import { ownerParkingsAPI, ownerDashboardAPI, getUserName } from "../../api/api";

function OwnerDashboard() {
  const navigate = useNavigate();
  const { parkingId } = useParams();

  const [parkings,    setParkings]    = useState([]);
  const [stats,       setStats]       = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [searchTerm,  setSearchTerm]  = useState("");

  const name = getUserName() || "Owner";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allParkData, statsData, revenue] = await Promise.all([
          ownerParkingsAPI.getAll(),
          ownerDashboardAPI.getStats(parkingId),
          ownerDashboardAPI.getRevenue(parkingId),
        ]);
        
        let parkData = allParkData || [];
        if (parkingId) {
            parkData = parkData.filter(p => p.id.toString() === parkingId);
        }
        
        setParkings(parkData);
        setStats(statsData);
        setRevenueData(revenue);
      } catch (err) {
        toast.error("Failed to load dashboard: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [parkingId]);

  const filtered = parkings.filter((p) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      (p.name     || "").toLowerCase().includes(t) ||
      (p.location || "").toLowerCase().includes(t)
    );
  });

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout
        role="OWNER"
        userInfo={{ name, role: "OWNER" }}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
              {parkingId && (
                 <button onClick={() => navigate("/owner/dashboard")} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" title="Back to All Parkings">
                   <FaArrowLeft className="text-lg" />
                 </button>
              )}
              {parkingId && parkings.length > 0 ? `${parkings[0].name} Dashboard` : "Owner Hub"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {parkingId ? "Monitor facility metrics, availability, and earnings" : "Overview of your managed parking spaces and real-time revenue"}
            </p>
          </div>
          <button
            onClick={() => navigate("/owner/add-parking")}
            className="parkease-btn-primary py-2.5 px-5 text-sm font-bold flex items-center gap-2 shadow-sm"
          >
            <FaPlus size={12} /> Add Parking Lot
          </button>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="text-primary-600 text-3xl animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard title="Total Facilities" value={String(stats?.totalParkings ?? parkings.length)} icon={<FaBuilding />} color="blue" trend={0} />
              <StatCard title="Total Capacity"   value={String(stats?.totalSlots ?? 0)} icon={<FaCar />} color="purple" trend={12} />
              <StatCard title="Today's Revenue"  value={`₹${(revenueData?.todayRevenue ?? 0).toFixed(0)}`} icon={<FaMoneyBillWave />} color="green" trend={24} />
              <StatCard title="Active Parked"    value={String(stats?.activeBookings ?? 0)} icon={<FaClock />} color="red" />
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Parking Facilities
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time status and slot allocations across your properties</p>
              </div>
            </div>

            {/* ── Empty state ──────────────────────────────────────────────── */}
            {filtered.length === 0 && (
              <div className="text-center py-20 parkease-card rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4 text-2xl">
                  <FaBuilding />
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1">No Parking Lots Added Yet</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">Start generating revenue by listing your first parking facility on ParkEase</p>
                <button
                  onClick={() => navigate("/owner/add-parking")}
                  className="parkease-btn-primary py-2.5 px-6 text-sm font-bold inline-flex items-center gap-2"
                >
                  <FaPlus size={12} /> Add Your First Facility
                </button>
              </div>
            )}

            {/* ── Parking cards ─────────────────────────────────────────────── */}
            {filtered.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtered.map((p) => {
                  const occupancyRate = p.totalSlots > 0
                    ? Math.round((p.occupied / p.totalSlots) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ y: -3 }}
                      className="parkease-card rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 mt-1">
                              <FaMapMarkerAlt className="text-slate-400" size={11} /> {p.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Occupancy</span>
                            <p className={`text-base font-bold ${occupancyRate > 75 ? "text-amber-600 dark:text-amber-400" : "text-primary-600 dark:text-primary-400"}`}>
                              {occupancyRate}%
                            </p>
                          </div>
                        </div>

                        {/* Occupancy bar */}
                        <div className="mb-5">
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${occupancyRate > 75 ? "bg-amber-500" : "bg-primary-600"}`}
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-primary-600 dark:text-primary-400 font-bold text-base">{p.totalSlots ?? 0}</p>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Total Capacity</p>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-900 dark:text-white font-bold text-base">{p.occupied ?? 0}</p>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Occupied</p>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                              {(p.totalSlots ?? 0) - (p.occupied ?? 0)}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Available</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => navigate(`/owner/slots/${p.id}`)}
                          className="py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all font-semibold flex items-center justify-center gap-2 text-xs shadow-sm"
                        >
                          <FaEdit size={12} className="text-primary-600" /> Manage Slots
                        </button>
                        <button
                          onClick={() => navigate(`/owner/bookings/${p.id}`)}
                          className="py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 text-primary-700 dark:text-primary-300 border border-primary-200/70 dark:border-primary-800/50 transition-all font-semibold flex items-center justify-center gap-2 text-xs shadow-sm"
                        >
                          <FaEye size={12} /> View Bookings
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </DashboardLayout>
    </>
  );
}

export default OwnerDashboard;
