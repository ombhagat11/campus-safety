import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UPLOAD_SETTINGS } from "../../utils/constants";
import { UploadCloud, X, FileImage, AlertCircle } from "lucide-react";
import Button from "../ui/Button";

const MediaUpload = ({ files, onFilesChange, uploadProgress = {} }) => {
    const onDrop = useCallback(
        (acceptedFiles) => {
            // Validate file size and count
            const validFiles = acceptedFiles.filter((file) => {
                if (file.size > UPLOAD_SETTINGS.MAX_FILE_SIZE) {
                    alert(`${file.name} is too large. Maximum size is 5MB.`);
                    return false;
                }
                return true;
            });

            if (files.length + validFiles.length > UPLOAD_SETTINGS.MAX_FILES) {
                alert(`You can only upload up to ${UPLOAD_SETTINGS.MAX_FILES} files.`);
                return;
            }

            onFilesChange([...files, ...validFiles]);
        },
        [files, onFilesChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": UPLOAD_SETTINGS.ACCEPTED_EXTENSIONS.split(","),
        },
        maxFiles: UPLOAD_SETTINGS.MAX_FILES,
    });

    const removeFile = (index) => {
        onFilesChange(files.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Add Photos</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Upload photos to help us understand the situation better (Optional)
                </p>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${isDragActive
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`p-4 rounded-full ${isDragActive ? "bg-primary-100 text-primary-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                        <UploadCloud className="w-8 h-8" />
                    </div>

                    <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {isDragActive ? "Drop files here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            SVG, PNG, JPG or GIF (max. 5MB)
                        </p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                        Attached Files ({files.length}/{UPLOAD_SETTINGS.MAX_FILES})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="relative flex items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm group"
                            >
                                {/* Preview */}
                                <div className="w-16 h-16 shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden mr-4">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* File info */}
                                <div className="flex-1 min-w-0 mr-2">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>

                                    {/* Upload progress */}
                                    {uploadProgress[index] !== undefined && (
                                        <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-primary-500 h-full rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress[index]}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>
                    Photos help authorities locate and assess the situation faster. Please avoid uploading sensitive personal information.
                </p>
            </div>
        </div>
    );
};

export default MediaUpload;
