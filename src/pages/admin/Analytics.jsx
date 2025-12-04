import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChart3, Calendar, Filter, ArrowUp, ArrowDown } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("week"); // week, month, year

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/admin/analytics", {
                params: { timeRange },
            });
            setAnalytics(response.data.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    // Transform data for charts
    const categoryData = analytics?.charts?.byCategory.map(item => ({
        name: item._id,
        value: item.count
    })) || [];

    const severityData = analytics?.charts?.bySeverity.map(item => ({
        severity: item._id.toString(),
        count: item.count
    })) || [];

    const stats = [
        { label: "Total Reports", value: analytics?.summary?.totalReports || 0, change: "+0%" },
        { label: "Active Users", value: analytics?.summary?.activeUsers || 0, change: "+0%" },
        { label: "Resolved", value: analytics?.summary?.resolvedReports || 0, change: "+0%" },
        { label: "Avg Response Time", value: `${(analytics?.summary?.avgResponseTime / (1000 * 60 * 60)).toFixed(1)}h`, change: "0%" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-500 rounded-lg text-white shadow-lg shadow-primary-500/30">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Analytics Dashboard
                            </h1>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg ml-11">
                            Campus safety insights and statistics
                        </p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        {["week", "month", "year"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${timeRange === range
                                        ? "bg-primary-500 text-white shadow-md"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={index} className="p-6">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <div className="flex items-end justify-between">
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                <span className={`flex items-center text-sm font-bold px-2 py-0.5 rounded-full ${stat.change.startsWith("+")
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    }`}>
                                    {stat.change.startsWith("+") ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                    {stat.change}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Category Distribution */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Reports by Category</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Severity Distribution */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Reports by Severity</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={severityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="severity"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Recent Reports Table */}
                <Card className="overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Reports</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Severity
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                                <Filter className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p>No recent reports to display</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
