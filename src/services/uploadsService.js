import apiClient from "./apiClient";

/**
 * Get S3 signed URL for file upload
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type
 */
export const getSignedUploadUrl = async (fileName, fileType) => {
    const response = await apiClient.post("/uploads/signed-url", {
        fileName,
        fileType,
    });
    return response.data;
};

/**
 * Upload file to S3 using signed URL
 * @param {File} file - File object from input
 * @param {function} onProgress - Progress callback (percentage)
 */
export const uploadFile = async (file, onProgress) => {
    // Get signed URL from backend
    const { data } = await getSignedUploadUrl(file.name, file.type);
    const { uploadUrl, fileUrl, key } = data;

    // Upload directly to S3
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) {
                const percentage = Math.round((e.loaded / e.total) * 100);
                onProgress(percentage);
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                resolve({ fileUrl, key });
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
    });
};

/**
 * Upload multiple files
 * @param {File[]} files - Array of files
 * @param {function} onProgress - Progress callback for all files
 */
export const uploadMultipleFiles = async (files, onProgress) => {
    const uploads = files.map((file, index) => {
        return uploadFile(file, (percentage) => {
            if (onProgress) {
                onProgress(index, percentage);
            }
        });
    });

    return Promise.all(uploads);
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 */
export const deleteFile = async (key) => {
    const response = await apiClient.delete(`/uploads/${encodeURIComponent(key)}`);
    return response.data;
};

export default {
    getSignedUploadUrl,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
};
