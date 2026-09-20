import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaCar, FaClock, FaHistory, FaSpinner, FaWallet, FaMapMarkerAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { dashboardAPI, bookingsAPI, getUserName } from "../../api/api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const name = getUserName() || "User";
  const profile = { name, role: "USER" };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsData, bookingsData] = await Promise.all([
          dashboardAPI.getStats(),
          bookingsAPI.getAll(),
        ]);
        setStats(statsData);
        setRecentBookings(bookingsData.slice(0, 5)); // Keep top 5
      } catch (err) {
        toast.error("Failed to load dashboard data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER" userInfo={profile}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              Welcome back, {name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Here is your parking activity and live session status at a glance
            </p>
          </div>
          <button 
            onClick={() => navigate("/user/find-parking")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5B4DF5] hover:bg-[#4F41E5] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <FaMapMarkerAlt /> Find Parking
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="text-[#5B4DF5] text-3xl animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Active Booking Banner */}
            {stats?.activeBooking && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/user/active-parking")}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl cursor-pointer hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-sm">
                    <FaCar className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-emerald-700 dark:text-emerald-300 font-bold text-base">Active Parking Session In Progress</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                      {stats.activeBooking.parkingName} · Slot <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats.activeBooking.slotCode}</span> · {stats.activeBooking.vehicleNumber}
                    </p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm">
                  View Session →
                </span>
              </motion.div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Bookings</p>
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#5B4DF5] dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center text-sm">
                    <FaHistory />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">{stats?.totalBookings || 0}</p>
              </div>

              <div className="p-5 bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Bookings</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center text-sm">
                    <FaCar />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">{stats?.activeBookings || 0}</p>
              </div>

              <div className="p-5 bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Spent</p>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center text-sm">
                    <FaWallet />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">₹{stats?.totalAmountSpent?.toFixed(0) || 0}</p>
              </div>

              <div className="p-5 bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer" onClick={() => navigate('/user/payments')}>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Wallet Balance</p>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center text-sm">
                    <FaWallet />
                  </div>
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-extrabold text-[#5B4DF5] font-heading">₹150</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Click to manage</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Bookings */}
              <div className="lg:col-span-2 bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                    <FaHistory className="text-[#5B4DF5]" /> Recent Bookings
                  </h3>
                  <button onClick={() => navigate("/user/bookings")} className="text-xs font-bold text-[#5B4DF5] hover:underline">View All</button>
                </div>
                
                {recentBookings.length > 0 ? (
                  <div className="space-y-3">
                    {recentBookings.map((b) => (
                      <div key={b.id} className="flex justify-between items-center p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${
                            b.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' :
                            b.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' :
                            'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {b.status === 'ACTIVE' ? <FaCar /> : <FaHistory />}
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-bold text-sm">{b.parkingName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Slot <span className="font-mono font-semibold">{b.slotCode}</span> · {new Date(b.startTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 dark:text-white font-extrabold text-sm font-heading">₹{b.amount || 0}</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900' :
                            b.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
                    <p>No recent bookings found.</p>
                  </div>
                )}
              </div>

              {/* Quick Actions & Peak Traffic */}
              <div className="space-y-6">
                
                {/* Peak Traffic */}
                <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl text-lg">
                      <FaClock />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-heading">Peak Demand Alert</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        High traffic expected in downtown lots from <span className="text-amber-700 dark:text-amber-400 font-bold">5:00 PM – 7:30 PM</span>. We recommend pre-booking your slot.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-slate-900 dark:text-white font-bold mb-4 text-sm font-heading">Quick Shortcuts</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate("/user/find-parking")} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-[#5B4DF5] hover:bg-[#EEF2FF]/30 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 flex flex-col items-center gap-2 cursor-pointer">
                      <FaMapMarkerAlt className="text-base text-[#5B4DF5]" /> Search
                    </button>
                    <button onClick={() => navigate("/user/bookings")} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-[#5B4DF5] hover:bg-[#EEF2FF]/30 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 flex flex-col items-center gap-2 cursor-pointer">
                      <FaHistory className="text-base text-[#5B4DF5]" /> History
                    </button>
                    <button onClick={() => navigate("/user/active-parking")} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-[#5B4DF5] hover:bg-[#EEF2FF]/30 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 flex flex-col items-center gap-2 cursor-pointer">
                      <FaCar className="text-base text-emerald-500" /> Active
                    </button>
                    <button onClick={() => navigate("/user/payments")} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-[#5B4DF5] hover:bg-[#EEF2FF]/30 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 flex flex-col items-center gap-2 cursor-pointer">
                      <FaWallet className="text-base text-amber-500" /> Payments
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}