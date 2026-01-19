import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import env from "../config/env.js";

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
    region: env.aws.region,
});

/**
 * Generate signed URL for direct upload to S3
 * POST /uploads/signed-url
 */
export const generateSignedUrl = async (req, res) => {
    try {
        const { fileName, fileType, fileSize } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({
                success: false,
                message: "fileName and fileType are required",
            });
        }

        // Validate file type (images and videos only)
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime"];
        if (!allowedTypes.includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: "File type not allowed. Only images and videos are permitted.",
            });
        }

        // Validate file size (max 10MB for images, 50MB for videos)
        const maxSize = fileType.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (fileSize && fileSize > maxSize) {
            return res.status(400).json({
                success: false,
                message: `File size exceeds maximum allowed (${maxSize / (1024 * 1024)}MB)`,
            });
        }

        // Generate unique file key
        const fileExtension = fileName.split(".").pop();
        const uniqueFileName = `${Date.now()}-${uuidv4()}.${fileExtension}`;
        const key = `uploads/${req.user.campusId}/${req.userId}/${uniqueFileName}`;

        // Generate signed URL
        const params = {
            Bucket: env.aws.bucketName,
            Key: key,
            Expires: 300, // URL valid for 5 minutes
            ContentType: fileType,
            ACL: "public-read", // Make uploaded files publicly readable
        };

        const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

        // Public URL for accessing the file
        const publicUrl = `https://${env.aws.bucketName}.s3.${env.aws.region}.amazonaws.com/${key}`;

        res.json({
            success: true,
            data: {
                uploadUrl,
                publicUrl,
                key,
                expiresIn: 300,
            },
        });
    } catch (error) {
        console.error("Generate signed URL error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate signed URL",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Delete file from S3
 * DELETE /uploads/:key
 */
export const deleteFile = async (req, res) => {
    try {
        const { key } = req.params;

        // Verify that the file belongs to the user or user is admin
        if (!key.includes(req.userId.toString()) && !req.user.canAdmin()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this file",
            });
        }

        const params = {
            Bucket: env.aws.bucketName,
            Key: decodeURIComponent(key),
        };

        await s3.deleteObject(params).promise();

        res.json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error) {
        console.error("Delete file error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete file",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

export default {
    generateSignedUrl,
    deleteFile,
};
