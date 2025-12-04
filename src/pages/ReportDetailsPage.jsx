import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById, reportSpam } from "../services/reportsService";
import useAuthStore from "../stores/authStore";
import socketService from "../services/socketService";
import { CATEGORY_LABELS, CATEGORY_ICONS, SEVERITY_LABELS, SEVERITY_COLORS, STATUS_LABELS, STATUS_COLORS } from "../utils/constants";
import { formatRelativeTime, formatDate } from "../utils/helpers";
import VoteButtons from "../components/ReportDetails/VoteButtons";
import CommentSection from "../components/ReportDetails/CommentSection";
import MapView from "../components/Map/MapView";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { ChevronLeft, Flag, MapPin, Calendar, AlertTriangle, User, Shield } from "lucide-react";

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
            const data = await getReportById(id);
            setReport(data.data.report);
        } catch (err) {
            console.error("Error fetching report:", err);
            setError("Failed to load report details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;

        // Join report room
        socketService.joinReport(id);

        // Listen for updates
        const unsubscribeUpdate = socketService.on("report_update", (data) => {
            if (data.reportId === id) {
                setReport(prev => ({ ...prev, ...data.data }));
            }
        });

        const unsubscribeComment = socketService.on("new_comment", (data) => {
            if (data.reportId === id) {
                setReport(prev => ({
                    ...prev,
                    commentsCount: (prev.commentsCount || 0) + 1
                }));
            }
        });

        return () => {
            unsubscribeUpdate();
            unsubscribeComment();
            socketService.leaveReport(id);
        };
    }, [id]);

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
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{error || "Report not found"}</p>
                <Button onClick={() => navigate("/app/map")}>
                    Back to Map
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="text-slate-600 dark:text-slate-400"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <span
                            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
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

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <Card className="overflow-hidden shadow-xl border-slate-200/60 dark:border-slate-700/60">
                    {/* Map Preview */}
                    <div className="h-64 w-full relative group">
                        <MapView
                            reports={[report]}
                            center={[report.location.coordinates[1], report.location.coordinates[0]]}
                            zoom={16}
                            className="z-0"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                            <div className="flex items-center gap-2 text-sm font-medium bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg">
                                <MapPin className="w-4 h-4" />
                                {report.location.coordinates[1].toFixed(6)}, {report.location.coordinates[0].toFixed(6)}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        {/* Header Info */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-4xl filter drop-shadow-sm" role="img" aria-label={report.category}>
                                        {CATEGORY_ICONS[report.category]}
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                        {report.title}
                                    </h1>
                                </div>

                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                        <Shield className="w-3.5 h-3.5" />
                                        {CATEGORY_LABELS[report.category]}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(report.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                        <AlertTriangle className="w-3.5 h-3.5" style={{ color: SEVERITY_COLORS[report.severity] }} />
                                        <span style={{ color: SEVERITY_COLORS[report.severity] }} className="font-semibold">
                                            {SEVERITY_LABELS[report.severity]} Severity
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0">
                                <VoteButtons
                                    reportId={report._id}
                                    initialVotes={{ confirm: report.confirmCount || 0, dispute: report.disputeCount || 0 }}
                                    userVote={report.userVote} // Assuming backend returns this
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-lg leading-relaxed">
                                {report.description}
                            </p>
                        </div>

                        {/* Media Gallery */}
                        {report.mediaUrls && report.mediaUrls.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                                    Evidence Photos
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {report.mediaUrls.map((url, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-all shadow-sm hover:shadow-md ring-1 ring-slate-200 dark:ring-slate-700"
                                            onClick={() => setSelectedImage(url)}
                                        >
                                            <img
                                                src={url}
                                                alt={`Evidence ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Author Info & Actions */}
                        <div className="flex items-center justify-between py-6 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${report.isAnonymous
                                    ? "bg-slate-400"
                                    : "bg-gradient-to-br from-indigo-500 to-purple-500"
                                    }`}>
                                    {report.isAnonymous ? <User className="w-5 h-5" /> : (report.reporterId?.name?.charAt(0) || "U")}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {report.isAnonymous ? "Anonymous User" : report.reporterId?.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Reported {formatRelativeTime(report.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReportSpam}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Flag className="w-4 h-4 mr-2" />
                                Report Spam
                            </Button>
                        </div>

                        {/* Comments */}
                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                            <CommentSection reportId={id} commentsCount={report.commentsCount} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                    />
                    <button
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <ChevronLeft className="w-6 h-6 rotate-180" /> {/* Close icon substitute or use X */}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportDetailsPage;
