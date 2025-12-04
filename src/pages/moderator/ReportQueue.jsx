import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import socketService from "../../services/socketService";
import { CATEGORY_LABELS, STATUS_LABELS, SEVERITY_COLORS, CATEGORY_ICONS } from "../../utils/constants";
import { formatRelativeTime } from "../../utils/helpers";
import { Check, X, Clock, AlertTriangle, User, Calendar, Filter, Search } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const ReportQueue = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(searchParams.get("status") || "reported");

    useEffect(() => {
        setSearchParams({ status: filter });
        fetchReports();
    }, [filter]);

    useEffect(() => {
        // Listen for new reports
        const unsubscribeNew = socketService.on("new_report", (data) => {
            if (filter === "reported") {
                setReports(prev => [data.data, ...prev]);
            }
        });

        // Listen for updates
        const unsubscribeUpdate = socketService.on("report_update", (data) => {
            // If status changed and doesn't match filter, remove it
            if (data.data.status && data.data.status !== filter) {
                setReports(prev => prev.filter(r => r._id !== data.reportId));
            }
            // If status matches filter (e.g. moved into this list), add it if not exists
            else if (data.data.status && data.data.status === filter) {
                // We need to fetch the full report or just add what we have
                // For now, let's just re-fetch to be safe and simple
                fetchReports();
            }
            // Otherwise just update the data
            else {
                setReports(prev => prev.map(report =>
                    report._id === data.reportId
                        ? { ...report, ...data.data }
                        : report
                ));
            }
        });

        return () => {
            unsubscribeNew();
            unsubscribeUpdate();
        };
    }, [filter]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/moderation/reports", {
                params: { status: filter },
            });
            setReports(response.data.data.reports || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (reportId, newStatus) => {
        try {
            await apiClient.patch(`/moderation/reports/${reportId}`, { status: newStatus });
            // Refresh list
            fetchReports();
        } catch (error) {
            console.error("Error updating report:", error);
            alert("Failed to update report status");
        }
    };

    const filterTabs = [
        { label: "Reported", value: "reported", count: reports.filter(r => r.status === "reported").length },
        { label: "Verified", value: "verified", count: reports.filter(r => r.status === "verified").length },
        { label: "Resolved", value: "resolved", count: reports.filter(r => r.status === "resolved").length },
        { label: "Invalid", value: "invalid", count: reports.filter(r => r.status === "invalid").length },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-500 rounded-lg text-white shadow-lg shadow-primary-500/30">
                            <Filter className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Report Queue
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg ml-11">
                        Review and moderate incident reports
                    </p>
                </div>

                {/* Filter Tabs */}
                <Card className="mb-8 p-1 overflow-hidden">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg flex items-center justify-center gap-2 ${filter === tab.value
                                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filter === tab.value
                                        ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Reports List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No reports found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">There are no {filter} reports to review at this time.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <Card
                                key={report._id}
                                className="p-6 hover:shadow-lg transition-all duration-300 border-l-4"
                                style={{ borderLeftColor: SEVERITY_COLORS[report.severity] }}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl" role="img" aria-label={report.category}>
                                                {CATEGORY_ICONS[report.category]}
                                            </span>
                                            <h3
                                                className="text-xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                onClick={() => navigate(`/app/report/${report._id}`)}
                                            >
                                                {report.title}
                                            </h3>
                                            <span
                                                className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: `${SEVERITY_COLORS[report.severity]}15`,
                                                    color: SEVERITY_COLORS[report.severity],
                                                }}
                                            >
                                                {report.severity} Severity
                                            </span>
                                        </div>

                                        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 text-base leading-relaxed">
                                            {report.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                {CATEGORY_LABELS[report.category] || report.category}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatRelativeTime(report.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                                <User className="w-3.5 h-3.5" />
                                                {report.isAnonymous ? "Anonymous" : report.reporterId?.name || "Unknown"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                                        {filter === "reported" && (
                                            <>
                                                <Button
                                                    onClick={() => handleStatusUpdate(report._id, "verified")}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                    size="sm"
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Verify
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate(report._id, "invalid")}
                                                    variant="outline"
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                                    size="sm"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Invalid
                                                </Button>
                                            </>
                                        )}
                                        {filter === "verified" && (
                                            <Button
                                                onClick={() => handleStatusUpdate(report._id, "resolved")}
                                                className="flex-1"
                                                size="sm"
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Resolve
                                            </Button>
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

export default ReportQueue;
