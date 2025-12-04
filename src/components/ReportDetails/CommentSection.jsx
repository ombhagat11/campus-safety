import { useState, useEffect } from "react";
import { getReportComments, addComment } from "../../services/reportsService";
import useAuthStore from "../../stores/authStore";
import { formatDistanceToNow } from "date-fns";
import { Send, User, Shield, AlertTriangle, MessageSquare } from "lucide-react";
import Button from "../ui/Button";

const CommentSection = ({ reportId, commentsCount = 0 }) => {
    const { user } = useAuthStore();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [reportId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await getReportComments(reportId);
            setComments(response.data.comments || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        try {
            setSubmitting(true);
            const response = await addComment(reportId, {
                content: newComment, // Changed from text to content to match backend
                isAnonymous,
            });

            // Add new comment to list
            setComments([response.data.comment, ...comments]);
            setNewComment("");
            setIsAnonymous(false);
        } catch (error) {
            console.error("Error adding comment:", error);
            // alert(error.response?.data?.message || "Failed to add comment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Comments <span className="text-slate-500 text-base font-normal">({comments.length})</span>
                </h3>
            </div>

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex gap-3">
                    <div className="shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows={2}
                            maxLength={500}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                />
                                Post anonymously
                            </label>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400">{newComment.length}/500</span>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!newComment.trim() || submitting}
                                    isLoading={submitting}
                                >
                                    <Send className="w-3 h-3 mr-2" />
                                    Post
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                    <p>No comments yet. Be the first to start the discussion.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment._id} className="group flex gap-3 animate-fade-in">
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${comment.isAnonymous
                                    ? "bg-slate-400"
                                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
                                }`}>
                                {comment.isAnonymous ? <User className="w-4 h-4" /> : (comment.userId?.name?.charAt(0).toUpperCase() || "U")}
                            </div>

                            {/* Comment Content */}
                            <div className="flex-1">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                            {comment.isAnonymous ? "Anonymous" : comment.userId?.name || "Unknown User"}
                                        </span>
                                        {comment.userId?.role === "moderator" && (
                                            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded">
                                                MOD
                                            </span>
                                        )}
                                        {comment.userId?.role === "admin" && (
                                            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold uppercase tracking-wider rounded">
                                                ADMIN
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400 ml-auto">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
