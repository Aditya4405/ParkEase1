import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  FaFileAlt, FaFileDownload, FaUsers, FaParking, FaHistory,
  FaMoneyBillWave, FaExchangeAlt, FaHeartbeat, FaSpinner
} from "react-icons/fa";
import { api } from "../../api/api";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState("");

  const downloadReport = async (type) => {
    try {
      setDownloading(type);
      let data = [];
      let filename = `parkease_${type}_report_${new Date().toISOString().split("T")[0]}.csv`;
      let headers = [];

      if (type === "users") {
        data = await api.get("/admin/users");
        headers = ["ID", "Name", "Email", "Phone", "Role", "Status", "Outstanding", "Bookings", "Joined Date"];
        const rows = data.map((u) => [
          u.id, `"${u.name}"`, u.email, u.phone || "", u.role, u.accountStatus, u.outstanding, u.totalBookings, u.createdAt
        ]);
        generateCSV(headers, rows, filename);
      } else if (type === "parkings") {
        data = await api.get("/admin/parkings");
        headers = ["ID", "Name", "Location", "Owner", "Total Slots", "Available", "Occupied", "Occupancy %", "Revenue"];
        const rows = data.map((p) => [
          p.id, `"${p.name}"`, `"${p.location}"`, `"${p.ownerName}"`, p.totalSlots, p.availableSlots, p.occupiedSlots, p.occupancyRate, p.revenue
        ]);
        generateCSV(headers, rows, filename);
      } else if (type === "bookings") {
        data = await api.get("/admin/bookings");
        headers = ["Booking ID", "Customer", "Facility", "Slot", "Vehicle", "Start Time", "End Time", "Amount", "Status"];
        const rows = data.map((b) => [
          b.id, `"${b.userName}"`, `"${b.parkingName}"`, b.slotCode, b.vehicleNumber, b.startTime, b.endTime, b.amount, b.status
        ]);
        generateCSV(headers, rows, filename);
      } else if (type === "transactions") {
        data = await api.get("/admin/transactions");
        headers = ["Transaction ID", "User", "Facility", "Method", "Amount", "Status", "Timestamp"];
        const rows = data.map((t) => [
          t.transactionId, `"${t.userName}"`, `"${t.parkingName}"`, t.method, t.amount, t.status, t.paidAt || t.createdAt
        ]);
        generateCSV(headers, rows, filename);
      }

      toast.success(`${type.toUpperCase()} report exported successfully!`);
    } catch (err) {
      toast.error(err.message || "Failed to generate report");
    } finally {
      setDownloading("");
    }
  };

  const generateCSV = (headers, rows, filename) => {
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportCards = [
    {
      id: "users",
      title: "User Registry Report",
      desc: "Export complete profiles, account statuses, lifetime booking counts, and outstanding balances.",
      icon: <FaUsers className="text-blue-400" />
    },
    {
      id: "parkings",
      title: "Facility Operations Report",
      desc: "Export parking lots, owner associations, slot capacities, occupancy averages, and revenues.",
      icon: <FaParking className="text-neon-blue" />
    },
    {
      id: "bookings",
      title: "Booking Ledger Report",
      desc: "Full log of all customer reservations, slot assignments, vehicle numbers, and durations.",
      icon: <FaHistory className="text-neon-purple" />
    },
    {
      id: "transactions",
      title: "Financial Settlements Report",
      desc: "Detailed record of payment transactions, payment gateways, receipts, and refund statuses.",
      icon: <FaExchangeAlt className="text-neon-green" />
    }
  ];

  return (
    <DashboardLayout role="ADMIN">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Compliance & Operational Reports</h1>
          <p className="text-xs text-gray-400 mt-1">
            Generate and export verifiable CSV audits from live database records
          </p>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCards.map((r) => (
          <div key={r.id} className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg mb-4">
                {r.icon}
              </div>
              <h3 className="text-base font-black text-white">{r.title}</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{r.desc}</p>
            </div>

            <div className="pt-6">
              <button
                onClick={() => downloadReport(r.id)}
                disabled={downloading === r.id}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-neon-blue to-blue-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                {downloading === r.id ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} />
                    <span>Compiling Report...</span>
                  </>
                ) : (
                  <>
                    <FaFileDownload size={12} />
                    <span>Download CSV Dataset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
