import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaMoneyBillWave, FaExchangeAlt, FaParking, FaCar,
  FaArrowUp, FaUser, FaSyncAlt, FaExclamationTriangle
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Revenue & Financials</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Financial Audit
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Settled gross merchandise volume, platform commissions, owner payouts, and category breakdown
          </p>
        </div>
        <button
          onClick={fetchRevenue}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer w-fit"
        >
          <FaSyncAlt size={11} className={loading ? "animate-spin text-primary-600" : ""} />
          <span>Refresh</span>
        </button>
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
        <div className="parkease-card rounded-2xl p-12 text-center text-slate-600 dark:text-slate-300 flex flex-col items-center gap-3 border-rose-200 dark:border-rose-900/40">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Unable to load financial statements</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchRevenue}
            className="mt-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaSyncAlt size={12} /> Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* KPI Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total GMV */}
            <div className="parkease-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue (GMV)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FaMoneyBillWave size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{fmtMoney(revenue?.totalRevenue)}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <FaArrowUp size={9} /> <span>From {revenue?.totalTransactions || 0} Transactions</span>
              </div>
            </div>

            {/* Platform Commission */}
            <div className="parkease-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Take (15%)</span>
                <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <FaMoneyBillWave size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{fmtMoney(revenue?.platformCommission)}</p>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 block">Direct Commission</span>
            </div>

            {/* Owner Disbursements */}
            <div className="parkease-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Owner Net Share (85%)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FaMoneyBillWave size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{fmtMoney(revenue?.ownerEarnings)}</p>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 block">Allocated to Owners</span>
            </div>

            {/* Average Booking Value */}
            <div className="parkease-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avg. Booking Value</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FaExchangeAlt size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{fmtMoney(revenue?.averageBookingValue)}</p>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 block">Per Completed Session</span>
            </div>
          </div>

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 1. Revenue by Parking */}
            <div className="parkease-card rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FaParking className="text-primary-600 dark:text-primary-400" /> Revenue by Facility
              </h2>
              <div className="space-y-3">
                {revenue?.revenueByParking?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No revenue data.</p>
                ) : (
                  revenue?.revenueByParking?.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{p.parking}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(p.revenue)} ({p.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${p.percentage}%` }}
                          className="h-full rounded-full bg-primary-600"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Revenue by Owner */}
            <div className="parkease-card rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FaUser className="text-purple-600 dark:text-purple-400" /> Revenue by Owner
              </h2>
              <div className="space-y-3">
                {revenue?.revenueByOwner?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No owner earnings recorded.</p>
                ) : (
                  revenue?.revenueByOwner?.map((o, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{o.owner}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{fmtMoney(o.revenue)} ({o.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${o.percentage}%` }}
                          className="h-full rounded-full bg-purple-600"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Revenue by Vehicle Type */}
            <div className="parkease-card rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FaCar className="text-amber-500" /> Revenue by Vehicle Type
              </h2>
              <div className="space-y-3">
                {revenue?.revenueByVehicle?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No vehicle data available.</p>
                ) : (
                  revenue?.revenueByVehicle?.map((v, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{v.vehicleType}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{fmtMoney(v.revenue)} ({v.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${v.percentage}%` }}
                          className="h-full rounded-full bg-amber-500"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Recent Settlements Table */}
          <div className="parkease-card rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Payment Settlements</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {revenue?.transactions?.slice(0, 10).map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-primary-600 dark:text-primary-400">
                        {t.transactionId || `#${t.bookingId}`}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{t.userName}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{t.parkingName} [{t.slotCode}]</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{t.vehicleNumber || t.vehicleType}</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(t.amount)}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{t.method || "UPI"}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
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
