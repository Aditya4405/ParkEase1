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
      <ToastContainer theme="dark" position="top-right" autoClose={3000}
        style={{ zIndex: 9999, top: "5rem", right: "1rem" }} />

      <DashboardLayout
        role="OWNER"
        userInfo={{ name, role: "OWNER" }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FaMoneyBillWave className="text-neon-green" /> Revenue Analytics
            </h2>
            <p className="text-gray-400">Detailed breakdown of your earnings and transactions</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="text-neon-blue text-4xl animate-spin" />
          </div>
        ) : (
          <>
            <div className="mb-10">
              <RevenueChart revenueData={revenueData} />
            </div>

            <div className="mt-10 mb-10">
              <RevenueAnalytics revenueData={revenueData} parkings={parkings} />
            </div>
          </>
        )}
      </DashboardLayout>
    </>
  );
}

export default OwnerRevenue;
