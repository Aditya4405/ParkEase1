import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaMoneyBillWave, FaExchangeAlt, FaParking, FaCar,
  FaArrowUp, FaFileDownload, FaUser, FaSyncAlt, FaExclamationTriangle
} from "react-icons/fa";
import { api } from "../../api/api";
import { CardSkeleton, TableSkeleton } from "../../components/common/Skeleton";

export default function RevenueManagement() {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/admin/revenue");
      setRevenue(data);
    } catch (err) {
      setError(err.message || "Failed to load revenue data");
      toast.error(err.message || "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fmtMoney = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

  return (
    <DashboardLayout role="ADMIN">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Platform Revenue & Financials</h1>
          <p className="text-xs text-gray-400 mt-1">
            Settled gross merchandise volume, platform commissions, owner earnings, and category breakdown
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <CardSkeleton count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableSkeleton rows={4} cols={3} />
            <TableSkeleton rows={4} cols={3} />
          </div>
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : error ? (
        <div className="bg-[#1e293b] border border-neon-red/30 rounded-2xl p-12 text-center text-gray-300 flex flex-col items-center gap-3">
          <FaExclamationTriangle className="text-neon-red text-3xl" />
          <p className="text-sm font-bold text-white">Unable to load financial statements</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={fetchRevenue}
            className="mt-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* KPI Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total GMV */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Gross Revenue (GMV)</span>
                <FaMoneyBillWave className="text-neon-green" />
              </div>
              <p className="text-2xl font-black text-white">{fmtMoney(revenue?.totalRevenue)}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-neon-green font-semibold">
                <FaArrowUp size={9} /> <span>From {revenue?.totalTransactions || 0} Transactions</span>
              </div>
            </div>

            {/* Platform Commission */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Platform Take (15%)</span>
                <FaMoneyBillWave className="text-neon-purple" />
              </div>
              <p className="text-2xl font-black text-white">{fmtMoney(revenue?.platformCommission)}</p>
              <span className="text-[11px] text-gray-400 font-semibold mt-2 block">Direct Commission</span>
            </div>

            {/* Owner Disbursements */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Owner Net Share (85%)</span>
                <FaMoneyBillWave className="text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white">{fmtMoney(revenue?.ownerEarnings)}</p>
              <span className="text-[11px] text-gray-400 font-semibold mt-2 block">Allocated to Owners</span>
            </div>

            {/* Average Booking Value */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg. Booking Value</span>
                <FaExchangeAlt className="text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">{fmtMoney(revenue?.averageBookingValue)}</p>
              <span className="text-[11px] text-gray-400 font-semibold mt-2 block">Per Completed Session</span>
            </div>
          </div>

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 1. Revenue by Parking */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                <FaParking className="text-neon-blue" /> Revenue by Facility
              </h2>
              <div className="space-y-3">
                {revenue?.revenueByParking?.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">No revenue data.</p>
                ) : (
                  revenue?.revenueByParking?.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-300 truncate max-w-[160px]">{p.parking}</span>
                        <span className="font-black text-neon-green">{fmtMoney(p.revenue)} ({p.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <div
                          style={{ width: `${p.percentage}%` }}
                          className="h-full rounded-full bg-neon-blue"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Revenue by Owner */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                <FaUser className="text-neon-purple" /> Revenue by Owner
              </h2>
              <div className="space-y-3">
                {revenue?.revenueByOwner?.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">No owner earnings recorded.</p>
                ) : (
                  revenue?.revenueByOwner?.map((o, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-300 truncate max-w-[160px]">{o.owner}</span>
                        <span className="font-black text-blue-400">{fmtMoney(o.revenue)} ({o.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <div
                          style={{ width: `${o.percentage}%` }}
                          className="h-full rounded-full bg-neon-purple"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Revenue by Vehicle Type */}
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                <FaCar className="text-amber-400" /> Revenue by Vehicle Type
              </h2>
              <div className="space-y-3">
                {revenue?.revenueByVehicle?.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">No vehicle data available.</p>
                ) : (
                  revenue?.revenueByVehicle?.map((v, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-300">{v.vehicleType}</span>
                        <span className="font-black text-amber-400">{fmtMoney(v.revenue)} ({v.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <div
                          style={{ width: `${v.percentage}%` }}
                          className="h-full rounded-full bg-amber-400"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Recent 20 Transactions Table */}
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-black text-white mb-4">Recent Payment Settlements</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/30 border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Txn / Booking</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Facility</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {revenue?.transactions?.slice(0, 10).map((t, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-mono font-bold text-gray-300">
                        {t.transactionId || `#${t.bookingId}`}
                      </td>
                      <td className="p-3 font-bold text-white">{t.userName}</td>
                      <td className="p-3 text-gray-300">{t.parkingName} [{t.slotCode}]</td>
                      <td className="p-3 text-gray-400">{t.vehicleNumber || t.vehicleType}</td>
                      <td className="p-3 font-black text-neon-green">{fmtMoney(t.amount)}</td>
                      <td className="p-3 text-gray-400">{t.method || "UPI"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-neon-green/20 text-neon-green border border-neon-green/30">
                          {t.status || "SUCCESS"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
