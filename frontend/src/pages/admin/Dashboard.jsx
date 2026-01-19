import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Shield,
    AlertTriangle,
    TrendingUp,
    Settings,
    UserPlus,
    BarChart3,
    MapPin,
    Activity,
    Database
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import apiClient from '../../services/apiClient';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalModerators: 0,
        totalReports: 0,
        activeCampuses: 0,
        systemHealth: 98
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            // Fetch analytics
            const analyticsResponse = await apiClient.get('/admin/analytics');
            const analytics = analyticsResponse.data.data;

            // Fetch users count
            const usersResponse = await apiClient.get('/admin/users?limit=1');
            const totalUsers = usersResponse.data.data.pagination?.total || 0;

            // Fetch campuses count
            const campusesResponse = await apiClient.get('/admin/campuses');
            const campuses = campusesResponse.data.data.campuses || [];

            // Calculate stats from analytics
            const statusData = analytics.charts.byStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            const totalReports = analytics.summary.totalReports;
            const totalModerators = campuses.reduce((sum, campus) => {
                return sum + (campus.moderatorCount || 0);
            }, 0);

            setStats({
                totalUsers,
                totalModerators,
                totalReports,
                activeCampuses: campuses.length,
                systemHealth: 98
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                            <p className="text-indigo-100 text-lg">System overview and management</p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                variant="primary"
                                icon={<UserPlus className="w-5 h-5" />}
                                onClick={() => navigate('/app/admin/users')}
                                className="bg-white text-indigo-600 hover:bg-indigo-50"
                            >
                                Add Moderator
                            </Button>
                            <Button
                                variant="outline"
                                icon={<Settings className="w-5 h-5" />}
                                className="border-white text-white hover:bg-white/10"
                            >
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* System Health */}
                <Card
                    title="System Health"
                    subtitle="All systems operational"
                    icon={<Activity className="w-5 h-5" />}
                    className="mb-8"
                    gradient
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">Overall Health</span>
                                        <span className="text-2xl font-bold text-green-600">{stats.systemHealth}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.systemHealth}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-6">
                                <div className="text-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                                    <p className="text-xs text-slate-600">API</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                                    <p className="text-xs text-slate-600">Database</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                                    <p className="text-xs text-slate-600">Storage</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                                    <p className="text-xs text-slate-600">Notifications</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        change="+12%"
                        changeType="positive"
                        trend="this month"
                        icon={<Users className="w-7 h-7" />}
                        color="blue"
                    />
                    <StatCard
                        title="Moderators"
                        value={stats.totalModerators}
                        change="+2"
                        changeType="positive"
                        trend="new this week"
                        icon={<Shield className="w-7 h-7" />}
                        color="purple"
                    />
                    <StatCard
                        title="Total Reports"
                        value={stats.totalReports}
                        change="+156"
                        changeType="neutral"
                        trend="this month"
                        icon={<AlertTriangle className="w-7 h-7" />}
                        color="amber"
                    />
                    <StatCard
                        title="Active Campuses"
                        value={stats.activeCampuses}
                        change="100%"
                        changeType="positive"
                        trend="uptime"
                        icon={<MapPin className="w-7 h-7" />}
                        color="green"
                    />
                </div>

                {/* Quick Actions & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card
                        title="Quick Actions"
                        icon={<Settings className="w-5 h-5" />}
                        hover
                    >
                        <div className="space-y-3">
                            <Button
                                variant="primary"
                                fullWidth
                                icon={<UserPlus className="w-4 h-4" />}
                                onClick={() => navigate('/app/admin/users')}
                            >
                                Manage Users
                            </Button>
                            <Button
                                variant="secondary"
                                fullWidth
                                icon={<Shield className="w-4 h-4" />}
                            >
                                Invite Moderator
                            </Button>
                            <Button
                                variant="outline"
                                fullWidth
                                icon={<BarChart3 className="w-4 h-4" />}
                                onClick={() => navigate('/app/admin/analytics')}
                            >
                                View Analytics
                            </Button>
                            <Button
                                variant="outline"
                                fullWidth
                                icon={<Database className="w-4 h-4" />}
                            >
                                System Logs
                            </Button>
                        </div>
                    </Card>

                    <Card
                        title="Recent Activity"
                        subtitle="Last 24 hours"
                        icon={<Activity className="w-5 h-5" />}
                        className="lg:col-span-2"
                        hover
                    >
                        <div className="space-y-3">
                            {[
                                { action: 'New user registered', time: '2 min ago', type: 'user' },
                                { action: 'Report verified by moderator', time: '15 min ago', type: 'report' },
                                { action: 'Campus settings updated', time: '1 hour ago', type: 'system' },
                                { action: 'New moderator added', time: '3 hours ago', type: 'admin' },
                                { action: 'Bulk reports processed', time: '5 hours ago', type: 'system' }
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${activity.type === 'user' ? 'bg-blue-500' :
                                            activity.type === 'report' ? 'bg-green-500' :
                                                activity.type === 'admin' ? 'bg-purple-500' :
                                                    'bg-slate-400'
                                            }`}></div>
                                        <span className="text-sm text-slate-700">{activity.action}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Management Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        title="User Management"
                        icon={<Users className="w-5 h-5" />}
                        hover
                        gradient
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Active Users</span>
                                <span className="font-semibold text-slate-900">{stats.totalUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Banned</span>
                                <span className="font-semibold text-red-600">0</span>
                            </div>
                            <Button
                                variant="outline"
                                fullWidth
                                size="sm"
                                onClick={() => navigate('/app/admin/users')}
                            >
                                View All Users
                            </Button>
                        </div>
                    </Card>

                    <Card
                        title="Report Analytics"
                        icon={<BarChart3 className="w-5 h-5" />}
                        hover
                        gradient
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Total Reports</span>
                                <span className="font-semibold text-slate-900">{stats.totalReports}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Resolved</span>
                                <span className="font-semibold text-green-600">85%</span>
                            </div>
                            <Button
                                variant="outline"
                                fullWidth
                                size="sm"
                                onClick={() => navigate('/app/admin/analytics')}
                            >
                                View Analytics
                            </Button>
                        </div>
                    </Card>

                    <Card
                        title="Campus Settings"
                        icon={<Settings className="w-5 h-5" />}
                        hover
                        gradient
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Active Campuses</span>
                                <span className="font-semibold text-slate-900">{stats.activeCampuses}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Moderators</span>
                                <span className="font-semibold text-purple-600">{stats.totalModerators}</span>
                            </div>
                            <Button
                                variant="outline"
                                fullWidth
                                size="sm"
                            >
                                Configure
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
