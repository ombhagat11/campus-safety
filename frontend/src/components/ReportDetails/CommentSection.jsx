import { useState, useEffect } from "react";
import { getReportComments, addComment } from "../../services/reportsService";
import useAuthStore from "../../stores/authStore";
import { formatDistanceToNow } from "date-fns";

const CommentSection = ({ reportId }) => {
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
            setComments(response.data?.data?.comments || response.data?.comments || []);
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
                content: newComment,
                isAnonymous,
            });

            // Add new comment to list
            const comment = response.data?.data?.comment || response.data?.comment;
            if (comment) {
                setComments([comment, ...comments]);
            }
            setNewComment("");
            setIsAnonymous(false);
        } catch (error) {
            const errorMsg = error.response?.data?.errors
                ? error.response.data.errors.map(e => `${e.field}: ${e.message}`).join('\n')
                : error.response?.data?.message || "Failed to add comment. Please try again.";
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">Comments ({comments.length})</h3>

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded"
                        />
                        Post anonymously
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{newComment.length}/500</span>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-0">
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {comment.isAnonymous
                                        ? "?"
                                        : comment.userId?.name?.charAt(0).toUpperCase() || "U"}
                                </div>

                                {/* Comment Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-900">
                                            {comment.isAnonymous ? "Anonymous" : comment.userId?.name || "Unknown User"}
                                        </span>
                                        {comment.userId?.role === "moderator" && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                Moderator
                                            </span>
                                        )}
                                        {comment.userId?.role === "admin" && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                                Admin
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{comment.text}</p>
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
