import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UPLOAD_SETTINGS } from "../../utils/constants";

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
        <div>
            <h2 className="text-xl font-bold mb-4">Add Photos (Optional)</h2>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
            >
                <input {...getInputProps()} />

                <div className="text-gray-600">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>

                    {isDragActive ? (
                        <p className="text-lg font-medium">Drop the files here...</p>
                    ) : (
                        <div>
                            <p className="text-lg font-medium mb-2">
                                Drag and drop photos here, or click to select
                            </p>
                            <p className="text-sm text-gray-500">
                                Maximum {UPLOAD_SETTINGS.MAX_FILES} files, 5MB each
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Supported: JPG, PNG, GIF, WebP
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-medium mb-3">Selected Files ({files.length})</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="relative border rounded-lg p-3 hover:bg-gray-50"
                            >
                                {/* Preview */}
                                <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* File info */}
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                {/* Upload progress */}
                                {uploadProgress[index] !== undefined && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${uploadProgress[index]}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {uploadProgress[index]}%
                                        </p>
                                    </div>
                                )}

                                {/* Remove button */}
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaUpload;
