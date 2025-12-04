import { useState } from "react";
import { voteOnReport } from "../../services/reportsService";
import { Check, X, ThumbsUp, ThumbsDown } from "lucide-react";
import Button from "../ui/Button";

const VoteButtons = ({ reportId, initialVotes = { confirm: 0, dispute: 0 }, userVote = null }) => {
    const [votes, setVotes] = useState(initialVotes);
    const [currentVote, setCurrentVote] = useState(userVote);
    const [loading, setLoading] = useState(false);

    const handleVote = async (voteType) => {
        if (loading) return;

        try {
            setLoading(true);

            // If clicking the same vote, remove it
            const newVoteType = currentVote === voteType ? null : voteType;

            await voteOnReport(reportId, newVoteType);

            // Update local state optimistically
            const newVotes = { ...votes };

            // Remove old vote count
            if (currentVote) {
                newVotes[currentVote] = Math.max(0, newVotes[currentVote] - 1);
            }

            // Add new vote count
            if (newVoteType) {
                newVotes[newVoteType] = (newVotes[newVoteType] || 0) + 1;
            }

            setVotes(newVotes);
            setCurrentVote(newVoteType);
        } catch (error) {
            console.error("Error voting:", error);
            // alert(error.response?.data?.message || "Failed to submit vote. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            {/* Confirm Button */}
            <button
                onClick={() => handleVote("confirm")}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${currentVote === "confirm"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 ring-1 ring-green-500"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/10"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <Check className={`w-4 h-4 ${currentVote === "confirm" ? "stroke-[3px]" : ""}`} />
                <span className="font-semibold text-sm">Confirm</span>
                <span className={`ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${currentVote === "confirm"
                        ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}>
                    {votes.confirm || 0}
                </span>
            </button>

            {/* Dispute Button */}
            <button
                onClick={() => handleVote("dispute")}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${currentVote === "dispute"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 ring-1 ring-red-500"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <X className={`w-4 h-4 ${currentVote === "dispute" ? "stroke-[3px]" : ""}`} />
                <span className="font-semibold text-sm">Dispute</span>
                <span className={`ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${currentVote === "dispute"
                        ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}>
                    {votes.dispute || 0}
                </span>
            </button>
        </div>
    );
};

export default VoteButtons;
