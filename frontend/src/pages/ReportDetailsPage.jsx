import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById, reportSpam } from "../services/reportsService";
import useAuthStore from "../stores/authStore";
import { CATEGORY_LABELS, CATEGORY_ICONS, SEVERITY_LABELS, SEVERITY_COLORS, STATUS_LABELS, STATUS_COLORS } from "../utils/constants";
import { formatRelativeTime, formatDate } from "../utils/helpers";
import VoteButtons from "../components/ReportDetails/VoteButtons";
import CommentSection from "../components/ReportDetails/CommentSection";
import MapView from "../components/Map/MapView";

const ReportDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await getReportById(id);
            // Handle both response.data.data.report and response.data.report
            const reportData = response.data?.data?.report || response.data?.report || response.data;
            setReport(reportData);
        } catch (err) {
            console.error("Error fetching report:", err);
            setError("Failed to load report details");
        } finally {
            setLoading(false);
        }
    };

    const handleReportSpam = async () => {
        if (!confirm("Are you sure you want to report this as spam?")) return;

        try {
            await reportSpam(id, "User reported as spam");
            alert("Report flagged for review. Thank you.");
        } catch (err) {
            alert("Failed to report spam");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error || "Report not found"}</p>
                <button
                    onClick={() => navigate("/app/map")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Map
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Nav */}
            <div className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    <div className="flex items-center space-x-2">
                        <span
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: `${STATUS_COLORS[report.status]}20`,
                                color: STATUS_COLORS[report.status]
                            }}
                        >
                            {STATUS_LABELS[report.status]}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Map Preview (Small) */}
                    <div className="h-48 w-full relative">
                        <MapView
                            reports={[report]}
                            center={[report.location.coordinates[1], report.location.coordinates[0]]}
                            onMarkerClick={() => { }} // Disable click
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                    </div>

                    <div className="p-6">
                        {/* Header Info */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center mb-2">
                                    <span className="text-3xl mr-3" role="img" aria-label={report.category}>
                                        {CATEGORY_ICONS[report.category]}
                                    </span>
                                    <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 space-x-4">
                                    <span>{CATEGORY_LABELS[report.category]}</span>
                                    <span>•</span>
                                    <span>{formatDate(report.createdAt)}</span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        Severity:
                                        <span
                                            className="ml-1 font-medium"
                                            style={{ color: SEVERITY_COLORS[report.severity] }}
                                        >
                                            {SEVERITY_LABELS[report.severity]}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <VoteButtons
                                reportId={report._id}
                                initialVotes={{ confirm: report.confirmCount || 0, dispute: report.disputeCount || 0 }}
                                userVote={report.userVote}
                            />
                        </div>

                        {/* Description */}
                        <div className="prose max-w-none mb-8">
                            <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                                {report.description}
                            </p>
                        </div>

                        {/* Media Gallery */}
                        {report.media && report.media.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-bold mb-3">Photos</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {report.media.map((url, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setSelectedImage(url)}
                                        >
                                            <img
                                                src={url}
                                                alt={`Report evidence ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Author Info */}
                        <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-8">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mr-3">
                                    {report.isAnonymous ? "?" : report.reporterId?.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {report.isAnonymous ? "Anonymous User" : report.reporterId?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Reported {formatRelativeTime(report.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleReportSpam}
                                className="text-gray-400 hover:text-red-500 text-sm flex items-center transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Report Spam
                            </button>
                        </div>

                        {/* Comments */}
                        <CommentSection reportId={id} />
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-w-full max-h-full rounded shadow-2xl"
                    />
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportDetailsPage;
