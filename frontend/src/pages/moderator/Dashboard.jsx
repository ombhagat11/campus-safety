import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    TrendingUp,
    Filter,
    Search,
    MoreVertical,
    Eye,
    Ban
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import apiClient from '../../services/apiClient';

const ModeratorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingReports: 0,
        verifiedToday: 0,
        totalUsers: 0,
        avgResponseTime: '0'
    });
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModeratorData();
        fetchStats();
    }, [filter]);

    const fetchModeratorData = async () => {
        try {
            const response = await apiClient.get('/moderation/reports', {
                params: { status: filter !== 'all' ? filter : undefined }
            });
            setReports(response.data.data.reports || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching moderator data:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Fetch summary stats
            const summaryResponse = await apiClient.get('/moderation/summary');
            const summaryData = summaryResponse.data.data.summary;

            // Fetch reported (pending) reports count
            const reportedResponse = await apiClient.get('/moderation/reports', {
                params: { status: 'reported', limit: 1 }
            });
            const pendingCount = reportedResponse.data.data.pagination?.total || 0;

            // Calculate verified today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const verifiedResponse = await apiClient.get('/moderation/reports', {
                params: { status: 'verified', limit: 100 }
            });
            const verifiedReports = verifiedResponse.data.data.reports || [];
            const verifiedToday = verifiedReports.filter(r => {
                const reportDate = new Date(r.updatedAt);
                return reportDate >= today;
            }).length;

            // Try to fetch user count (may not be accessible for moderators)
            let totalUsers = 0;
            try {
                const usersResponse = await apiClient.get('/admin/users?limit=1');
                totalUsers = usersResponse.data.data.pagination?.total || 0;
            } catch (error) {
                // Not accessible, use 0
            }

            setStats({
                pendingReports: pendingCount,
                verifiedToday: verifiedToday,
                totalUsers: totalUsers,
                avgResponseTime: '0' // Placeholder
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleAction = async (reportId, action) => {
        try {
            await apiClient.patch(`/moderation/reports/${reportId}`, { status: action });
            fetchModeratorData();
            fetchStats(); // Refresh stats after action
        } catch (error) {
            console.error('Error updating report:', error);
        }
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800'
        };
        return badges[severity] || badges[3];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold mb-2">Moderator Dashboard</h1>
                    <p className="text-purple-100 text-lg">Review and manage campus safety reports</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Pending Review"
                        value={stats.pendingReports}
                        change="3 new"
                        changeType="neutral"
                        trend="in last hour"
                        icon={<Clock className="w-7 h-7" />}
                        color="amber"
                    />
                    <StatCard
                        title="Verified Today"
                        value={stats.verifiedToday}
                        change="+25%"
                        changeType="positive"
                        trend="vs yesterday"
                        icon={<CheckCircle className="w-7 h-7" />}
                        color="green"
                    />
                    <StatCard
                        title="Active Users"
                        value={stats.totalUsers}
                        change="+8%"
                        changeType="positive"
                        trend="this week"
                        icon={<Users className="w-7 h-7" />}
                        color="blue"
                    />
                    <StatCard
                        title="Avg Response"
                        value={`${stats.avgResponseTime}m`}
                        change="-15%"
                        changeType="positive"
                        trend="faster"
                        icon={<TrendingUp className="w-7 h-7" />}
                        color="indigo"
                    />
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <Filter className="w-5 h-5 text-slate-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">All Reports</option>
                                <option value="reported">Reported</option>
                                <option value="verified">Verified</option>
                                <option value="resolved">Resolved</option>
                                <option value="invalid">Invalid</option>
                            </select>
                        </div>
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </Card>

                {/* Reports Queue */}
                <Card
                    title="Report Queue"
                    subtitle={`${reports.length} reports to review`}
                    icon={<AlertCircle className="w-5 h-5" />}
                >
                    <div className="space-y-4">
                        {reports.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">All caught up!</p>
                                <p className="text-sm mt-1">No reports to review at the moment</p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <div
                                    key={report._id}
                                    className="bg-slate-50 rounded-lg p-6 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityBadge(report.severity)}`}>
                                                    Severity {report.severity}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mb-3 line-clamp-2">{report.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                                                <span className="flex items-center">
                                                    <Users className="w-4 h-4 mr-1" />
                                                    {report.reporterName || 'Anonymous'}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="capitalize">{report.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                icon={<CheckCircle className="w-4 h-4" />}
                                                onClick={() => handleAction(report._id, 'verified')}
                                            >
                                                Verify
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                icon={<XCircle className="w-4 h-4" />}
                                                onClick={() => handleAction(report._id, 'invalid')}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                icon={<Eye className="w-4 h-4" />}
                                                onClick={() => navigate(`/app/report/${report._id}`)}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ModeratorDashboard;
