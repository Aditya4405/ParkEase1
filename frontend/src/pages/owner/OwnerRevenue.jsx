import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaMoneyBillWave, FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import RevenueChart from "../../components/dashboard/RevenueChart";
import RevenueAnalytics from "../../components/dashboard/RevenueAnalytics";
import { ownerParkingsAPI, ownerDashboardAPI, getUserName } from "../../api/api";

function OwnerRevenue() {
  const [parkings, setParkings] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = getUserName() || "Owner";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [parkData, revenue] = await Promise.all([
          ownerParkingsAPI.getAll(),
          ownerDashboardAPI.getRevenue(),
        ]);
        setParkings(parkData || []);
        setRevenueData(revenue);
      } catch (err) {
        toast.error("Failed to load revenue data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout
        role="OWNER"
        userInfo={{ name, role: "OWNER" }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2.5">
              <FaMoneyBillWave className="text-emerald-600 dark:text-emerald-400" /> Revenue & Financial Analytics
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Detailed breakdown of facility earnings, occupancy yield, and transactions</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="text-primary-600 text-3xl animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            <RevenueChart revenueData={revenueData} />
            <RevenueAnalytics revenueData={revenueData} parkings={parkings} />
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

export default OwnerRevenue;

