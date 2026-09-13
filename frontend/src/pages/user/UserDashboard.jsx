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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Welcome back, {name}</h2>
            <p className="text-gray-400">Here's your parking activity at a glance</p>
          </div>
          <button 
            onClick={() => navigate("/user/find-parking")}
            className="flex items-center gap-2 px-6 py-3 bg-neon-blue hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
          >
            <FaMapMarkerAlt /> Find Parking
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="text-neon-blue text-4xl animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Active Booking Banner */}
            {stats?.activeBooking && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/user/active-parking")}
                className="flex items-center justify-between gap-4 p-5 bg-neon-green/10 border border-neon-green/30 rounded-2xl cursor-pointer hover:bg-neon-green/15 transition-all shadow-[0_0_20px_rgba(34,197,94,0.1)]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center">
                    <FaCar className="text-neon-green text-2xl animate-pulse" />
                  </div>
                  <div>
                    <p className="text-neon-green font-black text-lg">Active Parking Session In Progress</p>
                    <p className="text-gray-300">
                      {stats.activeBooking.parkingName} · Slot <span className="font-mono text-neon-green">{stats.activeBooking.slotCode}</span> · {stats.activeBooking.vehicleNumber}
                    </p>
                  </div>
                </div>
                <span className="px-5 py-2.5 bg-neon-green text-black rounded-xl font-bold hover:bg-green-400 transition-all whitespace-nowrap flex items-center gap-2">
                  View Session →
                </span>
              </motion.div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <FaHistory className="text-4xl text-neon-blue" />
                </div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Bookings</p>
                <p className="text-3xl font-black text-white">{stats?.totalBookings || 0}</p>
              </div>

              <div className="p-5 bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <FaCar className="text-4xl text-neon-green" />
                </div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Active Bookings</p>
                <p className="text-3xl font-black text-white">{stats?.activeBookings || 0}</p>
              </div>

              <div className="p-5 bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <FaWallet className="text-4xl text-yellow-400" />
                </div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Spent</p>
                <p className="text-3xl font-black text-white">₹{stats?.totalAmountSpent?.toFixed(0) || 0}</p>
              </div>

              <div className="p-5 bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden group flex flex-col justify-between cursor-pointer hover:border-white/20 transition-all" onClick={() => navigate('/user/payments')}>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Wallet Balance</p>
                  <p className="text-3xl font-black text-neon-purple">₹150</p>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Click to top up</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Bookings */}
              <div className="lg:col-span-2 bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaHistory className="text-neon-blue" /> Recent Bookings
                  </h3>
                  <button onClick={() => navigate("/user/bookings")} className="text-sm text-neon-blue hover:text-blue-400">View All</button>
                </div>
                
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((b) => (
                      <div key={b.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            b.status === 'COMPLETED' ? 'bg-neon-blue/20 text-neon-blue' :
                            b.status === 'ACTIVE' ? 'bg-neon-green/20 text-neon-green' :
                            'bg-gray-700/50 text-gray-400'
                          }`}>
                            {b.status === 'ACTIVE' ? <FaCar /> : <FaHistory />}
                          </div>
                          <div>
                            <p className="text-white font-bold">{b.parkingName}</p>
                            <p className="text-xs text-gray-400">Slot <span className="font-mono">{b.slotCode}</span> · {new Date(b.startTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">₹{b.amount || 0}</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'COMPLETED' ? 'text-neon-blue border border-neon-blue/30' :
                            b.status === 'ACTIVE' ? 'text-neon-green border border-neon-green/30' :
                            'text-gray-400 border border-gray-600'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>No recent bookings.</p>
                  </div>
                )}
              </div>

              {/* Quick Actions & Peak Traffic */}
              <div className="space-y-6">
                
                {/* Peak Traffic */}
                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
                      <FaClock className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Peak Traffic</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        High demand expected <span className="text-orange-400 font-bold">5–7 PM</span> today.<br />Book in advance!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-white font-bold mb-4">Quick Links</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate("/user/find-parking")} className="p-3 bg-dark-card/60 rounded-lg border border-white/5 hover:border-neon-blue transition-all text-xs text-gray-300 flex flex-col items-center gap-2">
                      <FaMapMarkerAlt className="text-lg text-neon-blue" /> Search
                    </button>
                    <button onClick={() => navigate("/user/bookings")} className="p-3 bg-dark-card/60 rounded-lg border border-white/5 hover:border-neon-purple transition-all text-xs text-gray-300 flex flex-col items-center gap-2">
                      <FaHistory className="text-lg text-neon-purple" /> History
                    </button>
                    <button onClick={() => navigate("/user/active-parking")} className="p-3 bg-dark-card/60 rounded-lg border border-white/5 hover:border-neon-green transition-all text-xs text-gray-300 flex flex-col items-center gap-2">
                      <FaCar className="text-lg text-neon-green" /> Active
                    </button>
                    <button onClick={() => navigate("/user/payments")} className="p-3 bg-dark-card/60 rounded-lg border border-white/5 hover:border-yellow-400 transition-all text-xs text-gray-300 flex flex-col items-center gap-2">
                      <FaWallet className="text-lg text-yellow-400" /> Wallet
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