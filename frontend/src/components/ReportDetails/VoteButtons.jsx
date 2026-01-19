import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReportById, voteOnReport } from "../../services/reportsService";

const VoteButtons = ({ reportId, initialVotes = { confirm: 0, dispute: 0 }, userVote = null }) => {
    const navigate = useNavigate();
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
            const errorMsg = error.response?.data?.errors
                ? error.response.data.errors.map(e => `${e.field}: ${e.message}`).join('\n')
                : error.response?.data?.message || "Failed to submit vote. Please try again.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            {/* Confirm Button */}
            <button
                onClick={() => handleVote("confirm")}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${currentVote === "confirm"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-green-600 hover:bg-green-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Confirm</span>
                <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-sm">
                    {votes.confirm || 0}
                </span>
            </button>

            {/* Dispute Button */}
            <button
                onClick={() => handleVote("dispute")}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${currentVote === "dispute"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:bg-red-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">Dispute</span>
                <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-sm">
                    {votes.dispute || 0}
                </span>
            </button>
        </div>
    );
};

export default VoteButtons;
