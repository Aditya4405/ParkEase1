import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import { FaBuilding, FaPlus, FaCar, FaMoneyBillWave, FaClock, FaEdit, FaEye, FaSpinner, FaArrowLeft } from "react-icons/fa";
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
      <ToastContainer theme="dark" position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout
        role="OWNER"
        userInfo={{ name, role: "OWNER" }}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              {parkingId && (
                 <button onClick={() => navigate("/owner/dashboard")} className="text-gray-400 hover:text-white transition-colors" title="Back to All Parkings">
                   <FaArrowLeft className="text-xl" />
                 </button>
              )}
              {parkingId && parkings.length > 0 ? `${parkings[0].name} Dashboard` : "Owner Dashboard"}
            </h2>
            <p className="text-gray-400">
              {parkingId ? "Manage this specific parking lot and its earnings" : "Manage your parking lots and earnings"}
            </p>
          </div>
          <button
            onClick={() => navigate("/owner/add-parking")}
            className="px-6 py-3 bg-neon-green hover:bg-green-400 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all flex items-center gap-2"
          >
            <FaPlus /> Add Parking
          </button>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="text-neon-blue text-4xl animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Parkings"  value={String(stats?.totalParkings  ?? parkings.length)} icon={<FaBuilding />}      color="blue"   trend={0} />
              <StatCard title="Total Slots"     value={String(stats?.totalSlots     ?? 0)}               icon={<FaCar />}           color="purple" trend={12} />
              <StatCard title="Today's Revenue" value={`₹${(revenueData?.todayRevenue ?? 0).toFixed(0)}`} icon={<FaMoneyBillWave />} color="green"  trend={24} />
              <StatCard title="Active Bookings" value={String(stats?.activeBookings  ?? 0)}               icon={<FaClock />}         color="red" />
            </div>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-8 rounded-full bg-neon-blue"></span>
              My Parking Locations
            </h3>

            {/* ── Empty state ──────────────────────────────────────────────── */}
            {filtered.length === 0 && (
              <div className="text-center py-20 bg-dark-card/30 rounded-2xl border-2 border-dashed border-white/10">
                <FaBuilding className="text-5xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-6">No Parking Lots Added Yet</p>
                <button
                  onClick={() => navigate("/owner/add-parking")}
                  className="px-8 py-3.5 bg-neon-green hover:bg-green-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all inline-flex items-center gap-2"
                >
                  <FaPlus /> Add Your First Parking
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
                      whileHover={{ y: -5 }}
                      className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 group relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-neon-purple/10 rounded-full blur-[40px] group-hover:bg-neon-purple/20 transition-all" />

                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-white relative z-10">{p.name}</h4>
                            <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                              <FaBuilding className="text-neon-blue" /> {p.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Occupancy</p>
                            <p className={`text-xl font-bold ${occupancyRate > 75 ? "text-neon-red" : "text-neon-blue"}`}>
                              {occupancyRate}%
                            </p>
                          </div>
                        </div>

                        {/* Occupancy bar */}
                        <div className="mb-4">
                          <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full ${occupancyRate > 75 ? "bg-neon-red shadow-[0_0_10px_#ef4444]" : "bg-neon-blue shadow-[0_0_10px_#3b82f6]"}`}
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                          <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-neon-purple font-bold text-lg">{p.totalSlots ?? 0}</p>
                            <p className="text-[10px] text-gray-400 uppercase">Total</p>
                          </div>
                          <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-white font-bold text-lg">{p.occupied ?? 0}</p>
                            <p className="text-[10px] text-gray-400 uppercase">Active</p>
                          </div>
                          <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-neon-green font-bold text-lg">
                              {(p.totalSlots ?? 0) - (p.occupied ?? 0)}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase">Free</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <button
                          onClick={() => navigate(`/owner/slots/${p.id}`)}
                          className="py-2.5 rounded-lg bg-white/5 hover:bg-neon-blue/20 text-white border border-white/10 hover:border-neon-blue/50 transition-all font-bold flex items-center justify-center gap-2 text-sm"
                        >
                          <FaEdit /> Manage Slots
                        </button>
                        <button
                          onClick={() => navigate(`/owner/bookings/${p.id}`)}
                          className="py-2.5 rounded-lg bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple border border-neon-purple/30 hover:border-neon-purple/50 transition-all font-bold flex items-center justify-center gap-2 text-sm"
                        >
                          <FaEye /> View Bookings
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
