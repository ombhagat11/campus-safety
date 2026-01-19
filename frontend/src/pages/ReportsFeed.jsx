import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    MapPin,
    Clock,
    User,
    Filter,
    Search,
    Eye,
    MessageCircle,
    ThumbsUp,
    ThumbsDown,
    CheckCircle,
    XCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import apiClient from '../services/apiClient';
import useAuthStore from '../stores/authStore';
import ReportSidePanel from '../components/Reports/ReportSidePanel';

const ReportsFeed = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: 'all',
        category: 'all',
        severity: 'all',
        search: ''
    });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [filter, page]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
                ...(filter.status !== 'all' && { status: filter.status }),
                ...(filter.category !== 'all' && { category: filter.category }),
                ...(filter.severity !== 'all' && { severity: filter.severity }),
                ...(filter.search && { search: filter.search })
            };

            const response = await apiClient.get('/reports', { params });
            const newReports = response.data.data.reports || [];

            if (page === 1) {
                setReports(newReports);
            } else {
                setReports(prev => [...prev, ...newReports]);
            }

            setHasMore(newReports.length === 20);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilter(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    const getSeverityColor = (severity) => {
        const colors = {
            1: 'bg-green-100 text-green-800 border-green-200',
            2: 'bg-blue-100 text-blue-800 border-blue-200',
            3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            4: 'bg-orange-100 text-orange-800 border-orange-200',
            5: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[severity] || colors[3];
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            verified: 'bg-blue-100 text-blue-800 border-blue-200',
            resolved: 'bg-green-100 text-green-800 border-green-200',
            invalid: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || colors.pending;
    };

    const getCategoryIcon = (category) => {
        // You can customize icons based on category
        return <AlertTriangle className="w-5 h-5" />;
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const canModerate = user?.role === 'moderator' || user?.role === 'admin';

    const handleModerationAction = async (reportId, action) => {
        try {
            const endpoint = action === 'verify' ? `/reports/${reportId}/verify` : `/reports/${reportId}/reject`;
            await apiClient.patch(endpoint);

            // Update local state
            setReports(prev => prev.map(r =>
                r._id === reportId ? { ...r, status: action === 'verify' ? 'verified' : 'rejected' } : r
            ));

            if (selectedReport?._id === reportId) {
                setSelectedReport(prev => ({ ...prev, status: action === 'verify' ? 'verified' : 'rejected' }));
            }

            alert(`Report ${action}ed successfully!`);
        } catch (error) {
            console.error(`Error ${action}ing report:`, error);
            alert(`Failed to ${action} report.`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold mb-2">Reports Feed</h1>
                    <p className="text-blue-100 text-lg">All campus safety reports in one place</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={filter.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filter.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="resolved">Resolved</option>
                            <option value="invalid">Invalid</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={filter.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            <option value="theft">Theft</option>
                            <option value="assault">Assault</option>
                            <option value="harassment">Harassment</option>
                            <option value="vandalism">Vandalism</option>
                            <option value="fire">Fire</option>
                            <option value="medical">Medical</option>
                            <option value="suspicious_activity">Suspicious Activity</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </Card>

                {/* Reports List */}
                {loading && page === 1 ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No Reports Found</h3>
                            <p className="text-slate-500">Try adjusting your filters or create a new report</p>
                            <Button
                                variant="primary"
                                className="mt-4"
                                onClick={() => navigate('/app/create-report')}
                            >
                                Create Report
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <Card
                                key={report._id}
                                hover
                                className="cursor-pointer transition-all duration-200 group"
                                onClick={() => {
                                    console.log('Report clicked:', report._id);
                                    setSelectedReport(report);
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-start space-x-4 mb-3">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getSeverityColor(report.severity)} border`}>
                                                {getCategoryIcon(report.category)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                                                        Level {report.severity}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 line-clamp-2">{report.description}</p>
                                            </div>
                                        </div>

                                        {/* Meta Information */}
                                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                                            <span className="flex items-center">
                                                <User className="w-4 h-4 mr-1" />
                                                {report.isAnonymous ? 'Anonymous' : (report.reporterName || 'Unknown')}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {formatTimeAgo(report.createdAt)}
                                            </span>
                                            <span className="flex items-center capitalize">
                                                <AlertTriangle className="w-4 h-4 mr-1" />
                                                {report.category}
                                            </span>
                                            {report.location && (
                                                <span className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    Location
                                                </span>
                                            )}
                                        </div>

                                        {/* Engagement Stats */}
                                        <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-slate-200">
                                            <span className="flex items-center text-sm text-slate-600">
                                                <Eye className="w-4 h-4 mr-1" />
                                                {report.viewsCount || 0} views
                                            </span>
                                            <span className="flex items-center text-sm text-slate-600">
                                                <MessageCircle className="w-4 h-4 mr-1" />
                                                {report.commentsCount || 0} comments
                                            </span>
                                            <span className="flex items-center text-sm text-green-600">
                                                <ThumbsUp className="w-4 h-4 mr-1" />
                                                {report.confirmCount || 0}
                                            </span>
                                            <span className="flex items-center text-sm text-red-600">
                                                <ThumbsDown className="w-4 h-4 mr-1" />
                                                {report.disputeCount || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions (for moderators) */}
                                    {canModerate && report.status === 'pending' && (
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                icon={<CheckCircle className="w-4 h-4" />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleModerationAction(report._id, 'verify');
                                                }}
                                            >
                                                Verify
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                icon={<XCircle className="w-4 h-4" />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleModerationAction(report._id, 'reject');
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}

                        {/* Load More */}
                        {hasMore && !loading && (
                            <div className="text-center py-6">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load More Reports'}
                                </Button>
                            </div>
                        )}

                        {loading && page > 1 && (
                            <div className="flex justify-center py-6">
                                <div className="spinner"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Slide over Panel */}
            <ReportSidePanel
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onAction={handleModerationAction}
            />
        </div>
    );
};

export default ReportsFeed;
