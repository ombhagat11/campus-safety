import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import authService from "../services/authService";
import { getNearbyReports } from "../services/reportsService";
import { getCurrentLocation } from "../utils/helpers";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [stats, setStats] = useState({
        totalReports: 0,
        nearbyReports: 0,
        myReports: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch latest user data
        authService.getMe().catch((err) => {
            console.error("Failed to fetch user:", err);
            logout();
            navigate("/login");
        });

        // Fetch stats
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const location = await getCurrentLocation();
            const nearbyData = await getNearbyReports(location.latitude, location.longitude, 1000);
            setStats({
                totalReports: nearbyData.data.reports.length,
                nearbyReports: nearbyData.data.reports.filter(r => r.status === "verified").length,
                myReports: 0, // TODO: Fetch user's reports
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    // Role-based redirect
    useEffect(() => {
        if (user?.role === "moderator") {
            navigate("/app/moderator/dashboard", { replace: true });
        } else if (user?.role === "admin" || user?.role === "super-admin") {
            navigate("/app/admin/dashboard", { replace: true });
        }
    }, [user?.role, navigate]);

    // Don't render dashboard for non-students
    if (user?.role === "moderator" || user?.role === "admin" || user?.role === "super-admin") {
        return null;
    }

    const quickActions = [
        {
            title: "Create Report",
            description: "Report a new incident",
            icon: "📝",
            color: "bg-blue-100 text-blue-600",
            action: () => navigate("/app/create-report"),
        },
        {
            title: "View Map",
            description: "See nearby incidents",
            icon: "🗺️",
            color: "bg-green-100 text-green-600",
            action: () => navigate("/app/map"),
        },
        {
            title: "My Reports",
            description: "View your reports",
            icon: "📋",
            color: "bg-purple-100 text-purple-600",
            action: () => navigate("/app/my-reports"),
        },
        {
            title: "Notifications",
            description: `${0} unread`,
            icon: "🔔",
            color: "bg-yellow-100 text-yellow-600",
            action: () => { },
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-900 dark:to-slate-800">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Welcome back, {user?.name}!</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Here's what's happening on campus</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nearby Reports</h3>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900 dark:to-sky-900 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                                📍
                            </div>
                        </div>
                        <p className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">{stats.nearbyReports}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Within 1km</p>
                    </div>

                    <div className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Campus</h3>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                                🏫
                            </div>
                        </div>
                        <p className="text-xl font-semibold text-slate-900 dark:text-white truncate">{user?.campusId?.name || "Loading..."}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Code: {user?.campusId?.code || "..."}</p>
                    </div>

                    <div className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Role</h3>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                                👤
                            </div>
                        </div>
                        <p className="text-xl font-semibold text-slate-900 dark:text-white capitalize">{user?.role || "..."}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {user?.isVerified ? "✓ Verified" : "⚠ Not verified"}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-sky-500 dark:hover:border-sky-500 transition-all duration-300 text-left"
                            >
                                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 text-2xl group-hover:scale-110 transition-transform duration-200`}>
                                    {action.icon}
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{action.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">🛡️ Stay Safe on Campus</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Report Incidents</h3>
                            <p className="text-blue-100 text-sm">
                                See something suspicious? Report it immediately to help keep our campus safe.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Stay Informed</h3>
                            <p className="text-blue-100 text-sm">
                                Check the map regularly to stay aware of incidents in your area.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Emergency Contact</h3>
                            <p className="text-blue-100 text-sm">
                                In case of emergency, call campus security: <strong>911</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
