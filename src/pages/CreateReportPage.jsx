import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, MapPin, FileText, Image as ImageIcon, Send } from "lucide-react";
import LocationPicker from "../components/CreateReport/LocationPicker";
import ReportDetailsForm from "../components/CreateReport/ReportDetailsForm";
import FileUpload from "../components/ui/FileUpload";
import { createReport } from "../services/reportsService";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { REPORT_CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS, SEVERITY_COLORS } from "../utils/constants";
import toast from "react-hot-toast";

const STEPS = {
    LOCATION: 0,
    DETAILS: 1,
    MEDIA: 2,
    REVIEW: 3,
};

const STEP_CONFIG = [
    { id: STEPS.LOCATION, label: "Location", icon: MapPin },
    { id: STEPS.DETAILS, label: "Details", icon: FileText },
    { id: STEPS.MEDIA, label: "Media", icon: ImageIcon },
    { id: STEPS.REVIEW, label: "Review", icon: Check },
];

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
        mediaUrls: [], // URLs from UploadThing
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    const updateFormData = (updates) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.REVIEW) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (currentStep > STEPS.LOCATION) {
            setCurrentStep((prev) => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        try {
            setUploading(true);

            // Use media URLs from UploadThing (set by FileUpload component)
            const mediaUrls = formData.mediaUrls || [];

            // Create report
            const reportData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                severity: formData.severity,
                location: {
                    type: "Point",
                    coordinates: [formData.location.longitude, formData.location.latitude],
                },
                mediaUrls: mediaUrls,
                isAnonymous: formData.isAnonymous,
            };

            await createReport(reportData);
            toast.success("Report submitted successfully!");

            // Navigate to map
            navigate("/app/map", { replace: true });
        } catch (error) {
            console.error("Error creating report:", error);
            const errorMessage = error.response?.data?.message || "Failed to create report. Please try again.";
            toast.error(errorMessage);
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/app/map")}
                            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Create Report</h1>
                    </div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Step {currentStep + 1} of 4
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-700">
                    <div
                        className="h-full bg-primary-500 transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
                    />
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Stepper Visual */}
                <div className="mb-8 hidden sm:flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
                    {STEP_CONFIG.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive
                                        ? "border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110"
                                        : isCompleted
                                            ? "border-primary-500 bg-white dark:bg-slate-800 text-primary-500"
                                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400"
                                        }`}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-xs font-medium ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-500"}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Content Card */}
                <Card className="p-6 mb-8 shadow-xl border-slate-200/60 dark:border-slate-700/60">
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
                        <div className="space-y-4">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    Upload Media (Optional)
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Add photos or videos to support your report
                                </p>
                            </div>
                            <FileUpload
                                endpoint="reportImage"
                                maxFiles={5}
                                accept="image/*,video/*"
                                multiple
                                onUploadComplete={(uploadedFiles) => {
                                    const urls = uploadedFiles.map(file => file.url);
                                    updateFormData({ mediaUrls: urls });
                                    toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
                                }}
                                onUploadError={(error) => {
                                    toast.error('Upload failed: ' + error.message);
                                }}
                            />
                        </div>
                    )}

                    {currentStep === STEPS.REVIEW && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review Report</h2>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Please review the details before submitting
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-6 border border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Title</label>
                                        <p className="font-medium text-slate-900 dark:text-white">{formData.title}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{CATEGORY_ICONS[formData.category]}</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{CATEGORY_LABELS[formData.category]}</span>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{formData.description}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Severity</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[formData.severity] }} />
                                            <span className="font-medium text-slate-900 dark:text-white">{formData.severity}/5</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Location</label>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                                            {formData.location?.latitude.toFixed(6)}, {formData.location?.longitude.toFixed(6)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Attachments</label>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {formData.mediaUrls?.length || 0} {formData.mediaUrls?.length === 1 ? 'file' : 'files'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Privacy</label>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formData.isAnonymous
                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                            }`}>
                                            {formData.isAnonymous ? "Anonymous Report" : "Public Report"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === STEPS.LOCATION}
                        className={currentStep === STEPS.LOCATION ? "invisible" : ""}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {currentStep < STEPS.REVIEW ? (
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            disabled={!canProceed()}
                        >
                            Next Step
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            isLoading={uploading}
                            loadingText="Submitting..."
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Submit Report
                            <Send className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateReportPage;
