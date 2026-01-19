import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../components/CreateReport/LocationPicker";
import ReportDetailsForm from "../components/CreateReport/ReportDetailsForm";
import MediaUpload from "../components/CreateReport/MediaUpload";
import { createReport } from "../services/reportsService";
import { uploadMultipleFiles } from "../services/uploadsService";

const STEPS = {
    LOCATION: 0,
    DETAILS: 1,
    MEDIA: 2,
    REVIEW: 3,
};

const CreateReportPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(STEPS.LOCATION);
    const [formData, setFormData] = useState({
        location: null,
        title: "",
        description: "",
        category: "",
        severity: 3,
        isAnonymous: false,
        files: [],
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    const updateFormData = (updates) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.REVIEW) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > STEPS.LOCATION) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setUploading(true);

            // Upload files first
            let mediaUrls = [];
            if (formData.files.length > 0) {
                const uploadResults = await uploadMultipleFiles(
                    formData.files,
                    (index, percentage) => {
                        setUploadProgress((prev) => ({ ...prev, [index]: percentage }));
                    }
                );
                mediaUrls = uploadResults.map((result) => result.fileUrl);
            }

            // Create report with correct field names
            const reportData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                severity: formData.severity,
                location: {
                    type: "Point",
                    coordinates: [formData.location.longitude, formData.location.latitude],
                },
                mediaUrls: mediaUrls, // Changed from 'media' to 'mediaUrls'
                isAnonymous: formData.isAnonymous,
            };

            const response = await createReport(reportData);

            // Show success message
            alert('Report created successfully!');

            // Navigate to dashboard
            navigate("/app/dashboard", { replace: true });
        } catch (error) {
            console.error("Error creating report:", error);
            const errorMessage = error.response?.data?.message || "Failed to create report. Please try again.";
            alert(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case STEPS.LOCATION:
                return formData.location !== null;
            case STEPS.DETAILS:
                return formData.title && formData.description && formData.category;
            case STEPS.MEDIA:
                return true; // Media is optional
            case STEPS.REVIEW:
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Create Report</h1>
                        <button
                            onClick={() => navigate("/app/map")}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-6 flex items-center justify-between">
                        {["Location", "Details", "Media", "Review"].map((label, index) => (
                            <div key={label} className="flex items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${index <= currentStep
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-gray-300 bg-white text-gray-500"
                                        }`}
                                >
                                    {index + 1}
                                </div>
                                {index < 3 && (
                                    <div
                                        className={`mx-2 h-1 w-20 ${index < currentStep ? "bg-blue-600" : "bg-gray-300"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    {currentStep === STEPS.LOCATION && (
                        <LocationPicker
                            selectedLocation={formData.location}
                            onLocationSelect={(location) => updateFormData({ location })}
                        />
                    )}

                    {currentStep === STEPS.DETAILS && (
                        <ReportDetailsForm
                            formData={formData}
                            onChange={updateFormData}
                        />
                    )}

                    {currentStep === STEPS.MEDIA && (
                        <MediaUpload
                            files={formData.files}
                            onFilesChange={(files) => updateFormData({ files })}
                            uploadProgress={uploadProgress}
                        />
                    )}

                    {currentStep === STEPS.REVIEW && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Review Your Report</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="font-medium">Location</label>
                                    <p className="text-gray-600">
                                        {formData.location?.latitude.toFixed(6)}, {formData.location?.longitude.toFixed(6)}
                                    </p>
                                </div>

                                <div>
                                    <label className="font-medium">Title</label>
                                    <p className="text-gray-600">{formData.title}</p>
                                </div>

                                <div>
                                    <label className="font-medium">Description</label>
                                    <p className="text-gray-600">{formData.description}</p>
                                </div>

                                <div>
                                    <label className="font-medium">Category</label>
                                    <p className="text-gray-600">{formData.category}</p>
                                </div>

                                <div>
                                    <label className="font-medium">Severity</label>
                                    <p className="text-gray-600">{formData.severity}/5</p>
                                </div>

                                <div>
                                    <label className="font-medium">Photos</label>
                                    <p className="text-gray-600">{formData.files.length} files</p>
                                </div>

                                {formData.isAnonymous && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                        <p className="text-sm text-yellow-800">
                                            ⚠️ This report will be submitted anonymously
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === STEPS.LOCATION}
                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Back
                    </button>

                    {currentStep < STEPS.REVIEW ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={uploading}
                            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {uploading ? "Submitting..." : "Submit Report"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateReportPage;
