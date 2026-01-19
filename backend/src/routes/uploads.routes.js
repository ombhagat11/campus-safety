import express from "express";
import { generateSignedUrl, deleteFile } from "../controllers/uploads.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /uploads/signed-url
 * @desc    Generate signed URL for S3 upload
 * @access  Private
 */
router.post("/signed-url", authenticate, generateSignedUrl);

/**
 * @route   DELETE /uploads/:key
 * @desc    Delete file from S3
 * @access  Private
 */
router.delete("/:key", authenticate, deleteFile);

export default router;
