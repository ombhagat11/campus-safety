import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import apiClient from "../services/apiClient";
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS, CATEGORY_ICONS, SEVERITY_COLORS } from "../utils/constants";
import { formatRelativeTime } from "../utils/helpers";
import { Plus, Search, MapPin, Calendar, AlertTriangle, User } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const MyReportsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyReports();
    }, []);

    const fetchMyReports = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/users/${user._id}/reports`);
            setReports(response.data.data.reports || []);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError(err.response?.data?.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchMyReports}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Reports</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Track the status of your submitted reports
                        </p>
                    </div>
                    <Button onClick={() => navigate("/app/create-report")}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Report
                    </Button>
                </div>

                {reports.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 animate-fade-in">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No reports yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
                            You haven't submitted any reports yet. Help keep the campus safe by reporting incidents.
                        </p>
                        <Button onClick={() => navigate("/app/create-report")}>
                            Create First Report
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        {reports.map((report) => (
                            <Card
                                key={report._id}
                                hover
                                onClick={() => navigate(`/app/report/${report._id}`)}
                                className="p-5 border-l-4"
                                style={{ borderLeftColor: STATUS_COLORS[report.status] }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl" role="img" aria-label={report.category}>
                                                {CATEGORY_ICONS[report.category]}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                                {report.title}
                                            </h3>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-sm mb-4">
                                            {report.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                <Calendar className="w-3 h-3" />
                                                {formatRelativeTime(report.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                <MapPin className="w-3 h-3" />
                                                {report.location?.coordinates[1].toFixed(4)}, {report.location?.coordinates[0].toFixed(4)}
                                            </span>
                                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                <AlertTriangle className="w-3 h-3" style={{ color: SEVERITY_COLORS[report.severity] }} />
                                                Severity: {report.severity}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span
                                            className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                            style={{
                                                backgroundColor: `${STATUS_COLORS[report.status]}20`,
                                                color: STATUS_COLORS[report.status]
                                            }}
                                        >
                                            {STATUS_LABELS[report.status]}
                                        </span>
                                        {report.isAnonymous && (
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                Anonymous
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReportsPage;
