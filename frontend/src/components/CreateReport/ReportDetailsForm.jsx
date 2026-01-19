import { REPORT_CATEGORIES, CATEGORY_LABELS } from "../../utils/constants";

const ReportDetailsForm = ({ formData, onChange }) => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Report Details</h2>

            <div className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="Brief summary of the incident"
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.title.length}/100 characters
                    </p>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        placeholder="Provide detailed information about what happened"
                        rows={5}
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/1000 characters
                    </p>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => onChange({ category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a category</option>
                        {Object.entries(REPORT_CATEGORIES).map(([key, value]) => (
                            <option key={value} value={value}>
                                {CATEGORY_LABELS[value]}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Severity */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Severity: {formData.severity}/5
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.severity}
                        onChange={(e) => onChange({ severity: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Low</span>
                        <span>Moderate</span>
                        <span>Medium</span>
                        <span>High</span>
                        <span>Critical</span>
                    </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="anonymous"
                        checked={formData.isAnonymous}
                        onChange={(e) => onChange({ isAnonymous: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm">
                        Report anonymously
                    </label>
                </div>

                {formData.isAnonymous && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Your name will not be visible to other users, but moderators can see it for verification purposes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportDetailsForm;
