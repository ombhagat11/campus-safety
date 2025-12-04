import { useState } from 'react';
import { useUploadThing } from '../../utils/uploadthing';
import { Upload, X, Image as ImageIcon, Video, FileText, Loader2 } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

/**
 * FileUpload Component
 * Handles file uploads using UploadThing
 * 
 * @param {Object} props
 * @param {string} props.endpoint - UploadThing endpoint ('reportImage', 'reportVideo', 'profilePicture')
 * @param {Function} props.onUploadComplete - Callback when upload completes
 * @param {Function} props.onUploadError - Callback when upload fails
 * @param {number} props.maxFiles - Maximum number of files (default: 1)
 * @param {string} props.accept - Accepted file types
 * @param {boolean} props.multiple - Allow multiple files
 * @param {string} props.className - Additional CSS classes
 */
const FileUpload = ({
    endpoint = 'reportImage',
    onUploadComplete,
    onUploadError,
    maxFiles = 1,
    accept = 'image/*',
    multiple = false,
    className = '',
}) => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const { startUpload, isUploading } = useUploadThing(endpoint, {
        onClientUploadComplete: (res) => {
            console.log('Upload complete:', res);
            toast.success('Files uploaded successfully!');
            setUploading(false);
            setFiles([]);
            setPreviews([]);
            if (onUploadComplete) {
                onUploadComplete(res);
            }
        },
        onUploadError: (error) => {
            console.error('Upload error:', error);
            toast.error(error.message || 'Upload failed');
            setUploading(false);
            if (onUploadError) {
                onUploadError(error);
            }
        },
    });

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} file(s) allowed`);
            return;
        }

        setFiles(selectedFiles);

        // Generate previews
        const newPreviews = selectedFiles.map((file) => {
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onloadend = () => {
                    resolve({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: reader.result,
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newPreviews).then(setPreviews);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        setUploading(true);
        await startUpload(files);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return ImageIcon;
        if (type.startsWith('video/')) return Video;
        return FileText;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* File Input */}
            <div className="relative">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    disabled={uploading || isUploading}
                />
                <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
            ${uploading || isUploading
                            ? 'border-slate-300 bg-slate-50 cursor-not-allowed'
                            : 'border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <Upload className={`w-10 h-10 mb-2 ${uploading || isUploading ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {uploading || isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {accept === 'image/*' ? 'Images only' : accept === 'video/*' ? 'Videos only' : 'Images and videos'}
                        {maxFiles > 1 && ` (Max ${maxFiles} files)`}
                    </p>
                </label>
            </div>

            {/* File Previews */}
            {previews.length > 0 && (
                <div className="space-y-2">
                    {previews.map((preview, index) => {
                        const FileIcon = getFileIcon(preview.type);
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                                {/* Preview Thumbnail */}
                                {preview.type.startsWith('image/') ? (
                                    <img
                                        src={preview.url}
                                        alt={preview.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                                        <FileIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                                    </div>
                                )}

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {preview.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatFileSize(preview.size)}
                                    </p>
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    disabled={uploading || isUploading}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
                <Button
                    onClick={handleUpload}
                    disabled={uploading || isUploading}
                    className="w-full"
                    variant="primary"
                >
                    {uploading || isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                        </>
                    )}
                </Button>
            )}
        </div>
    );
};

export default FileUpload;
