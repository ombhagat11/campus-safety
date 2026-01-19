import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle,
    Plus,
    Bell,
    Shield
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import apiClient from '../services/apiClient';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalReports: 0,
        activeReports: 0,
        resolvedReports: 0,
        nearbyIncidents: 0
    });
    const [recentReports, setRecentReports] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch user profile to get their ID and notification preferences
            const userResponse = await apiClient.get('/auth/me');
            const userData = userResponse.data.data.user;
            setUser(userData);

            // Check user role
            const isModerator = userData.role === 'moderator';
            const isAdmin = ['admin', 'super-admin'].includes(userData.role);

            if (isAdmin) {
                // Admins use admin analytics endpoint
                const analyticsResponse = await apiClient.get('/admin/analytics');
                const analytics = analyticsResponse.data.data;

                // Fetch recent reports (limit 5 for display)
                const recentReportsResponse = await apiClient.get('/reports?limit=5&sortBy=createdAt&sortOrder=desc');
                const recentReports = recentReportsResponse.data.data.reports || [];

                // Calculate stats from analytics
                const statusData = analytics.charts.byStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {});

                const totalReports = analytics.summary.totalReports;
                const activeReports = (statusData.reported || 0) + (statusData.verified || 0);
                const resolvedReports = statusData.resolved || 0;
                const nearbyIncidents = statusData.reported || 0;

                setStats({
                    totalReports,
                    activeReports,
                    resolvedReports,
                    nearbyIncidents
                });
                setRecentReports(recentReports);
            } else if (isModerator) {
                // Moderators use moderation endpoints
                // Fetch all reports count
                const allReportsResponse = await apiClient.get('/moderation/reports', {
                    params: { limit: 1 }
                });
                const totalReports = allReportsResponse.data.data.pagination?.total || 0;

                // Fetch reported count
                const reportedResponse = await apiClient.get('/moderation/reports', {
                    params: { status: 'reported', limit: 1 }
                });
                const reportedCount = reportedResponse.data.data.pagination?.total || 0;

                // Fetch verified count
                const verifiedResponse = await apiClient.get('/moderation/reports', {
                    params: { status: 'verified', limit: 1 }
                });
                const verifiedCount = verifiedResponse.data.data.pagination?.total || 0;

                // Fetch resolved count
                const resolvedResponse = await apiClient.get('/moderation/reports', {
                    params: { status: 'resolved', limit: 1 }
                });
                const resolvedCount = resolvedResponse.data.data.pagination?.total || 0;

                // Fetch recent reports - use general reports endpoint to get all statuses
                const recentReportsResponse = await apiClient.get('/reports', {
                    params: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }
                });
                const recentReports = recentReportsResponse.data.data.reports || [];

                setStats({
                    totalReports,
                    activeReports: reportedCount + verifiedCount,
                    resolvedReports: resolvedCount,
                    nearbyIncidents: reportedCount
                });
                setRecentReports(recentReports);
            } else {
                // Student mode - fetch personal stats
                // Fetch user's own reports
                const userReportsResponse = await apiClient.get(`/users/${userData._id}/reports`);
                const userReports = userReportsResponse.data.data.reports || [];

                // Fetch recent reports (limit 5 for display)
                const recentReportsResponse = await apiClient.get('/reports?limit=5&sortBy=createdAt&sortOrder=desc');
                const recentReports = recentReportsResponse.data.data.reports || [];

                // Fetch nearby reports if user has location
                let nearbyReports = [];
                if (navigator.geolocation) {
                    try {
                        const position = await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject);
                        });

                        const { latitude, longitude } = position.coords;
                        const radius = userData.notificationPreferences?.radius || 500; // meters

                        const nearbyResponse = await apiClient.get(
                            `/reports/nearby?lat=${latitude}&lon=${longitude}&radius=${radius}`
                        );
                        nearbyReports = nearbyResponse.data.data.reports || [];
                    } catch (geoError) {
                        console.log('Location access denied or unavailable:', geoError);
                    }
                }

                // Calculate stats
                const totalReports = userReports.length;
                const activeReports = userReports.filter(
                    report => report.status === 'reported' || report.status === 'verified'
                ).length;
                const resolvedReports = userReports.filter(
                    report => report.status === 'resolved'
                ).length;
                const nearbyIncidents = nearbyReports.length;

                // Update state
                setStats({
                    totalReports,
                    activeReports,
                    resolvedReports,
                    nearbyIncidents
                });
                setRecentReports(recentReports);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800'
        };
        return colors[severity] || colors[3];
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            verified: 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            invalid: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.pending;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Campus Safety Dashboard</h1>
                            <p className="text-blue-100 text-lg">Stay informed and keep your campus safe</p>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            icon={<Plus className="w-5 h-5" />}
                            onClick={() => navigate('/app/create-report')}
                            className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl"
                        >
                            Report Incident
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title={user?.role === 'student' ? 'My Reports' : 'Campus Reports'}
                        value={stats.totalReports}
                        change="+12%"
                        changeType="positive"
                        trend="vs last month"
                        icon={<AlertTriangle className="w-7 h-7" />}
                        color="blue"
                    />
                    <StatCard
                        title="Active Incidents"
                        value={stats.activeReports}
                        change="-5%"
                        changeType="positive"
                        trend="vs last week"
                        icon={<Clock className="w-7 h-7" />}
                        color="amber"
                    />
                    <StatCard
                        title="Resolved"
                        value={stats.resolvedReports}
                        change="+18%"
                        changeType="positive"
                        trend="this month"
                        icon={<CheckCircle className="w-7 h-7" />}
                        color="green"
                    />
                    <StatCard
                        title={user?.role === 'student' ? 'Nearby Alerts' : 'Pending Reports'}
                        value={stats.nearbyIncidents}
                        change="2 new"
                        changeType="neutral"
                        trend={user?.role === 'student' ? 'within 500m' : 'needs attention'}
                        icon={<MapPin className="w-7 h-7" />}
                        color="indigo"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card
                        title="Quick Actions"
                        icon={<Shield className="w-5 h-5" />}
                        gradient
                        hover
                    >
                        <div className="space-y-3">
                            <Button
                                variant="primary"
                                fullWidth
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => navigate('/app/create-report')}
                            >
                                Create New Report
                            </Button>
                            <Button
                                variant="outline"
                                fullWidth
                                icon={<MapPin className="w-4 h-4" />}
                                onClick={() => navigate('/app/map')}
                            >
                                View Map
                            </Button>
                            <Button
                                variant="outline"
                                fullWidth
                                icon={<Bell className="w-4 h-4" />}
                                onClick={() => navigate('/app/profile')}
                            >
                                Notification Settings
                            </Button>
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card
                        title="Recent Reports"
                        subtitle="Your latest submissions"
                        icon={<TrendingUp className="w-5 h-5" />}
                        className="lg:col-span-2"
                        hover
                    >
                        <div className="space-y-3">
                            {recentReports.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No reports yet</p>
                                    <p className="text-sm mt-1">Create your first report to get started</p>
                                </div>
                            ) : (
                                recentReports.map((report) => (
                                    <div
                                        key={report._id}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/app/report/${report._id}`)}
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900">{report.title}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{report.category}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                                                Level {report.severity}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Safety Tips */}
                <Card
                    title="Safety Tips"
                    subtitle="Stay safe on campus"
                    icon={<Shield className="w-5 h-5" />}
                    gradient
                    hover
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-3">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-2">Stay Alert</h4>
                            <p className="text-sm text-slate-600">Be aware of your surroundings and report suspicious activity immediately.</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white mb-3">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-2">Know Your Location</h4>
                            <p className="text-sm text-slate-600">Always be aware of emergency exits and safe zones on campus.</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white mb-3">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-2">Report Quickly</h4>
                            <p className="text-sm text-slate-600">Use the app to report incidents quickly and help keep everyone safe.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
