import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaMapMarkerAlt, FaCar, FaHeart, FaRegHeart, FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { parkingsAPI, getUserName } from "../../api/api";

export default function FindParking() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);

  const name = getUserName() || "User";
  const profile = { name, role: "USER" };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const parkData = await parkingsAPI.getAll();
        setParkings(parkData || []);
      } catch (err) {
        toast.error("Failed to load parking data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = parkings.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
      toast.info("Removed from favorites");
    } else {
      setFavorites([...favorites, id]);
      toast.success("Added to favorites");
    }
  };

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />
      <DashboardLayout role="USER" onSearch={setSearch} searchTerm={search} userInfo={profile}>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Listings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">Find Parking</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Explore nearby verified lots and reserved parking spaces</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#5B4DF5] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                {filtered.length} locations available
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <FaSpinner className="text-[#5B4DF5] text-3xl animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#131C31] rounded-2xl border border-slate-200/80 dark:border-slate-800 border-dashed p-8">
                <p className="text-slate-500 dark:text-slate-400 text-base font-medium">No parking facilities match your search query.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try typing a city, landmark, or lot name.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -3 }}
                    className={`group relative bg-white dark:bg-[#131C31] rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-200 ${
                      p.availableSlots > 0 ? "border-slate-200/80 dark:border-slate-800 hover:border-[#5B4DF5]/40" : "border-slate-200/50 dark:border-slate-800/50 opacity-75"
                    }`}
                  >
                    {/* Favorite */}
                    <button
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 transition-colors z-10 cursor-pointer"
                    >
                      {favorites.includes(p.id) ? <FaHeart className="text-rose-500 text-lg" /> : <FaRegHeart className="text-lg" />}
                    </button>

                    <div className="flex justify-between items-start">
                      <div className="pr-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">{p.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                          <FaMapMarkerAlt className="text-[#5B4DF5] flex-shrink-0" /> {p.location}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        p.availableSlots > 0
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                      }`}>
                        {p.availableSlots > 0 ? `${p.availableSlots} Free` : "FULL"}
                      </div>
                    </div>

                    {/* Slot summary */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{p.availableSlots}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold mt-0.5">Free</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <p className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">{p.occupiedSlots}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold mt-0.5">Occupied</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <p className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{p.totalSlots}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold mt-0.5">Total</p>
                      </div>
                    </div>

                    {/* Price & vehicles */}
                    <div className="mt-3 p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <span className="text-[#5B4DF5] font-extrabold text-sm">₹{p.minCostPerHour}</span>
                        {p.minCostPerHour !== p.maxCostPerHour && <span className="text-slate-400"> – ₹{p.maxCostPerHour}</span>}
                        <span className="text-slate-400">/hr</span>
                      </p>
                      <div className="flex gap-1.5">
                        {(p.vehicleTypes || []).map(vt => (
                          <span key={vt} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md text-[10px] text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">{vt}</span>
                        ))}
                      </div>
                    </div>

                    {p.description && (
                      <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500 italic line-clamp-1">{p.description}</p>
                    )}

                    <button
                      disabled={p.availableSlots === 0}
                      onClick={() => navigate(`/user/slots/${p.id}`)}
                      className={`mt-4 w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${p.availableSlots > 0
                          ? "bg-[#5B4DF5] hover:bg-[#4F41E5] text-white shadow-md hover:shadow-lg"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      <FaCar /> {p.availableSlots > 0 ? "Book Now" : "Unavailable"}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Map Widget */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 rounded-3xl h-[520px] relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-slate-100/60 dark:bg-slate-900">
                <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ backgroundImage: "radial-gradient(#5B4DF5 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                <div className="absolute top-1/2 left-0 w-full h-10 bg-white/70 dark:bg-slate-800/40 -translate-y-1/2 border-y border-slate-200 dark:border-slate-700 transform -skew-y-3" />
                <div className="absolute top-0 left-1/3 w-12 h-full bg-white/70 dark:bg-slate-800/40 -translate-x-1/2 border-x border-slate-200 dark:border-slate-700 transform skew-x-12" />
                <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="absolute top-[40%] left-[35%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group/marker">
                <div className="relative">
                  <div className="w-5 h-5 bg-[#5B4DF5] rounded-full shadow-md z-10 relative border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">P</div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[#5B4DF5] rounded-full animate-ping opacity-60" />
                </div>
              </div>

              {filtered.slice(0, 3).map((p, i) => (
                <div key={`map-marker-${p.id}`} className="absolute cursor-pointer" style={{ top: `${20 + i * 25}%`, left: `${60 - i * 10}%` }}>
                  <div className="relative">
                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-sm z-10 relative border-2 border-white" />
                  </div>
                </div>
              ))}

              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#131C31] via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 font-heading">Interactive Map View</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live spot telematics active
                </p>
                <button
                  onClick={() => window.open("https://www.google.com/maps", "_blank")}
                  className="w-full py-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-xl backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <FaMapMarkerAlt className="text-[#5B4DF5]" /> Open Full Map View
                </button>
              </div>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}
