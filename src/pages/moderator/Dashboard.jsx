import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import useAuthStore from "../../stores/authStore";
import socketService from "../../services/socketService";
import { Shield, Clock, CheckCircle, Target, FileText, Map as MapIcon, AlertTriangle } from "lucide-react";
import Card from "../../components/ui/Card";

const ModeratorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        pendingReports: 0,
        verifiedToday: 0,
        resolvedToday: 0,
        totalReports: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();

        // Listen for updates to refresh stats
        const handleUpdate = () => {
            fetchStats();
        };

        const unsubscribeNew = socketService.on("new_report", handleUpdate);
        const unsubscribeUpdate = socketService.on("report_update", handleUpdate);
        const unsubscribeAction = socketService.on("moderator_action", handleUpdate);

        return () => {
            unsubscribeNew();
            unsubscribeUpdate();
            unsubscribeAction();
        };
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/moderation/summary");


            // Backend returns: { success, data: { summary: { pendingCount, verifiedToday, resolvedToday, totalReports, spamCount }, recentActions } }
            const summaryData = response.data.data?.summary || {};

            setStats({
                pendingReports: summaryData.pendingCount || 0,
                verifiedToday: summaryData.verifiedToday || 0,
                resolvedToday: summaryData.resolvedToday || 0,
                totalReports: summaryData.totalReports || 0,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            // Set default values on error
            setStats({
                pendingReports: 0,
                verifiedToday: 0,
                resolvedToday: 0,
                totalReports: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Pending Review",
            value: stats.pendingReports || 0,
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/20",
            action: () => navigate("/app/moderator/queue?status=pending"),
        },
        {
            title: "Verified Today",
            value: stats.verifiedToday || 0,
            icon: CheckCircle,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/20",
        },
        {
            title: "Resolved Today",
            value: stats.resolvedToday || 0,
            icon: Target,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "Total Reports",
            value: stats.totalReports || 0,
            icon: FileText,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-100 dark:bg-purple-900/20",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-500 rounded-lg text-white shadow-lg shadow-primary-500/30">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Moderator Dashboard
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg ml-11">
                        Welcome back, {user?.name}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => (
                        <Card
                            key={index}
                            onClick={card.action}
                            className={`p-6 transition-all duration-300 ${card.action ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : ""}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-1">{card.value}</p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate("/app/moderator/queue")}
                            className="group flex items-center gap-4 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 text-left"
                        >
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-lg">Review Queue</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Moderate pending reports</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate("/app/moderator/queue?status=verified")}
                            className="group flex items-center gap-4 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 text-left"
                        >
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-lg">Verified Reports</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">View verified incidents</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate("/app/map")}
                            className="group flex items-center gap-4 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 text-left"
                        >
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <MapIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-lg">View Map</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">See all reports on map</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p>No recent activity to display</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ModeratorDashboard;
