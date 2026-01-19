import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { CATEGORY_LABELS, STATUS_LABELS, SEVERITY_COLORS } from "../../utils/constants";
import { formatRelativeTime } from "../../utils/helpers";

const ReportQueue = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(searchParams.get("status") || "reported");
    const [statusCounts, setStatusCounts] = useState({
        reported: 0,
        verified: 0,
        resolved: 0,
        invalid: 0
    });

    useEffect(() => {
        fetchReports();
        fetchStatusCounts();
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

    const fetchStatusCounts = async () => {
        try {
            // Fetch counts for all statuses
            const statuses = ['reported', 'verified', 'resolved', 'invalid'];
            const countPromises = statuses.map(status =>
                apiClient.get("/moderation/reports", {
                    params: { status, limit: 1 }
                })
            );

            const responses = await Promise.all(countPromises);
            const counts = {};

            statuses.forEach((status, index) => {
                counts[status] = responses[index].data.data.pagination?.total || 0;
            });

            setStatusCounts(counts);
        } catch (error) {
            console.error("Error fetching status counts:", error);
        }
    };

    const handleStatusUpdate = async (reportId, newStatus) => {
        try {
            await apiClient.patch(`/moderation/reports/${reportId}`, { status: newStatus });
            // Refresh list and counts
            fetchReports();
            fetchStatusCounts();
        } catch (error) {
            console.error("Error updating report:", error);
            alert("Failed to update report status");
        }
    };

    const filterTabs = [
        { label: "Reported", value: "reported", count: statusCounts.reported },
        { label: "Verified", value: "verified", count: statusCounts.verified },
        { label: "Resolved", value: "resolved", count: statusCounts.resolved },
        { label: "Invalid", value: "invalid", count: statusCounts.invalid },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Report Queue</h1>
                    <p className="text-gray-600 mt-2">Review and moderate incident reports</p>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${filter === tab.value
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reports List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600">No {filter} reports found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div
                                key={report._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3
                                                className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                                                onClick={() => navigate(`/app/report/${report._id}`)}
                                            >
                                                {report.title}
                                            </h3>
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: `${SEVERITY_COLORS[report.severity]}20`,
                                                    color: SEVERITY_COLORS[report.severity],
                                                }}
                                            >
                                                Severity {report.severity}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{CATEGORY_LABELS[report.category]}</span>
                                            <span>•</span>
                                            <span>{formatRelativeTime(report.createdAt)}</span>
                                            <span>•</span>
                                            <span>
                                                {report.isAnonymous ? "Anonymous" : report.reporterId?.name || "Unknown"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {filter === "reported" && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleStatusUpdate(report._id, "verified")}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                            >
                                                Verify
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(report._id, "invalid")}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                Mark Invalid
                                            </button>
                                        </div>
                                    )}
                                    {filter === "verified" && (
                                        <button
                                            onClick={() => handleStatusUpdate(report._id, "resolved")}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium ml-4"
                                        >
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportQueue;
