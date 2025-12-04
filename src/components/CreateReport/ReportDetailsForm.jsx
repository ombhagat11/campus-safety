import { REPORT_CATEGORIES, CATEGORY_LABELS } from "../../utils/constants";
import Input from "../ui/Input";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

const ReportDetailsForm = ({ formData, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Report Details</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Provide as much detail as possible to help us assist you better
                </p>
            </div>

            <div className="space-y-5">
                {/* Title */}
                <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Brief summary of the incident"
                    maxLength={100}
                    required
                    helperText={`${formData.title.length}/100 characters`}
                />

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        placeholder="Provide detailed information about what happened..."
                        rows={5}
                        maxLength={1000}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-slate-900 dark:text-white placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-500 mt-1.5 text-right">
                        {formData.description.length}/1000 characters
                    </p>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(REPORT_CATEGORIES).map(([key, value]) => (
                            <button
                                key={value}
                                onClick={() => onChange({ category: value })}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2 ${formData.category === value
                                        ? "bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    }`}
                            >
                                <span className="text-xl">{getCategoryIcon(value)}</span>
                                {CATEGORY_LABELS[value]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Severity */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Severity Level
                        </label>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getSeverityColorClass(formData.severity)}`}>
                            {getSeverityLabel(formData.severity)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={formData.severity}
                        onChange={(e) => onChange({ severity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                        <span>Low</span>
                        <span>Critical</span>
                    </div>
                </div>

                {/* Anonymous Toggle */}
                <div
                    onClick={() => onChange({ isAnonymous: !formData.isAnonymous })}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-4 ${formData.isAnonymous
                            ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                >
                    <div className={`p-2 rounded-lg ${formData.isAnonymous ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                        {formData.isAnonymous ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold ${formData.isAnonymous ? "text-amber-900 dark:text-amber-200" : "text-slate-900 dark:text-white"}`}>
                                Submit Anonymously
                            </h3>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.isAnonymous ? "bg-amber-500" : "bg-slate-300"}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.isAnonymous ? "translate-x-4" : ""}`} />
                            </div>
                        </div>
                        <p className={`text-sm ${formData.isAnonymous ? "text-amber-700 dark:text-amber-300" : "text-slate-500"}`}>
                            {formData.isAnonymous
                                ? "Your identity will be hidden from public view. Moderators can still see it for verification."
                                : "Your name will be visible on the report."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper functions
const getCategoryIcon = (category) => {
    const icons = {
        theft: "💰",
        assault: "⚠️",
        harassment: "🚫",
        vandalism: "🔨",
        suspicious_activity: "👁️",
        emergency: "🚨",
        fire: "🔥",
        medical: "🏥",
        hazard: "⚡",
        other: "📌",
    };
    return icons[category] || "📌";
};

const getSeverityLabel = (severity) => {
    const labels = ["Low", "Moderate", "Medium", "High", "Critical"];
    return labels[severity - 1] || "Unknown";
};

const getSeverityColorClass = (severity) => {
    const classes = {
        1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        2: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        3: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        4: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        5: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return classes[severity] || "bg-slate-100 text-slate-700";
};

export default ReportDetailsForm;
