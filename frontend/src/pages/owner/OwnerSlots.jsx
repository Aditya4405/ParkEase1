import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FaSpinner } from "react-icons/fa";

/**
 * OwnerSlots (/owner/slots) is the old localStorage-based slot viewer.
 * ManageParkingSlots (/owner/slots/:parkingId) is the new backend-wired version.
 *
 * This component redirects to the owner dashboard so the owner can pick
 * a specific parking to manage — a parkingId is always required.
 */
export default function OwnerSlots() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/owner/dashboard", { replace: true });
  }, [navigate]);

  return (
    <DashboardLayout role="OWNER">
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="text-neon-blue text-4xl animate-spin" />
      </div>
    </DashboardLayout>
  );
}