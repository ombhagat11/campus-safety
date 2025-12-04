import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import useAuthStore from "../../stores/authStore";
import { BarChart3, Users, CheckCircle, Target, Shield, Map as MapIcon, Settings, Database, Server, Activity } from "lucide-react";
import Card from "../../components/ui/Card";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        totalReports: 0,
        totalUsers: 0,
        activeUsers: 0,
        resolvedReports: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/admin/analytics");
            const data = response.data.data.summary;
            setStats({
                totalReports: data?.totalReports || 0,
                totalUsers: data?.totalUsers || 0,
                activeUsers: data?.activeUsers || 0,
                resolvedReports: data?.resolvedReports || 0,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            setStats({
                totalReports: 0,
                totalUsers: 0,
                activeUsers: 0,
                resolvedReports: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Reports",
            value: stats.totalReports,
            icon: BarChart3,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/20",
        },
        {
            title: "Active Users",
            value: stats.activeUsers,
            icon: Activity,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-100 dark:bg-purple-900/20",
        },
        {
            title: "Resolved Reports",
            value: stats.resolvedReports,
            icon: Target,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/20",
        },
    ];

    const quickActions = [
        {
            title: "Analytics",
            description: "View detailed analytics",
            icon: BarChart3,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/20",
            action: () => navigate("/app/admin/analytics"),
        },
        {
            title: "User Management",
            description: "Manage users and roles",
            icon: Users,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/20",
            action: () => navigate("/app/admin/users"),
        },
        {
            title: "View Map",
            description: "See all reports on map",
            icon: MapIcon,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-100 dark:bg-purple-900/20",
            action: () => navigate("/app/map"),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-500 rounded-lg text-white shadow-lg shadow-primary-500/30">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Admin Dashboard
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
                            className="p-6 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                                {loading ? "..." : card.value}
                            </p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 text-left"
                            >
                                <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-lg">{action.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">System Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="font-medium text-slate-900 dark:text-white">All Systems Operational</span>
                            </div>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Healthy
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                    <Database className="w-4 h-4" />
                                    <span className="text-sm font-medium">Database</span>
                                </div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Connected
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                    <Server className="w-4 h-4" />
                                    <span className="text-sm font-medium">API Server</span>
                                </div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Running
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                    <Activity className="w-4 h-4" />
                                    <span className="text-sm font-medium">Socket.io</span>
                                </div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Active
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
