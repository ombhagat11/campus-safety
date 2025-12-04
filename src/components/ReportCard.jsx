import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, MessageSquare, ThumbsUp, AlertTriangle, User } from "lucide-react";
import Card from "./ui/Card";
import { formatRelativeTime } from "../utils/helpers";
import { CATEGORY_ICONS, STATUS_COLORS, STATUS_LABELS, SEVERITY_COLORS } from "../utils/constants";

const ReportCard = ({ report }) => {
    const navigate = useNavigate();

    return (
        <Card
            hover
            onClick={() => navigate(`/app/report/${report._id}`)}
            className="overflow-hidden border-l-4"
            style={{ borderLeftColor: STATUS_COLORS[report.status] }}
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                            {CATEGORY_ICONS[report.category] || "📌"}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                {report.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {report.isAnonymous ? "Anonymous" : report.author?.name || "Unknown"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatRelativeTime(report.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0"
                        style={{
                            backgroundColor: `${STATUS_COLORS[report.status]}20`,
                            color: STATUS_COLORS[report.status]
                        }}
                    >
                        {STATUS_LABELS[report.status]}
                    </span>
                </div>

                {/* Content */}
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                    {report.description}
                </p>

                {/* Media Preview (if any) */}
                {report.mediaUrls && report.mediaUrls.length > 0 && (
                    <div className="mb-4 h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                        <img
                            src={report.mediaUrls[0]}
                            alt="Report attachment"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {report.mediaUrls.length > 1 && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm">
                                +{report.mediaUrls.length - 1} more
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">
                                {report.location?.coordinates[1].toFixed(4)}, {report.location?.coordinates[0].toFixed(4)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" style={{ color: SEVERITY_COLORS[report.severity] }} />
                            <span>Severity: {report.severity}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-slate-400 hover:text-primary-500 transition-colors text-sm group">
                            <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>{report.upvotes?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors text-sm group">
                            <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>{report.commentsCount || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ReportCard;
