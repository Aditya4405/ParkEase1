import DashboardLayout from "../components/layout/DashboardLayout";

export default function Placeholder() {
    return (
        <DashboardLayout role="USER">
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Coming Soon</h1>
                <p className="text-gray-400 text-lg">This feature is currently under development.</p>
                <div className="mt-8 w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        </DashboardLayout>
    );
}
