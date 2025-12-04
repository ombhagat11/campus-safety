import { generateReactHelpers } from "@uploadthing/react";

/**
 * UploadThing React Helpers
 * These helpers provide hooks and utilities for file uploads
 */
export const { useUploadThing, uploadFiles } = generateReactHelpers({
    url: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/uploadthing`,
});
