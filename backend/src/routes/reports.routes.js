import express from "express";
import {
    getAllReports,
    getNearbyReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    voteReport,
    addComment,
    getReportComments,
    reportSpam,
    verifyReport,
    rejectReport,
    resolveReport,
} from "../controllers/reports.controller.js";
import { authenticate, requireVerifiedEmail } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
    getNearbySchema,
    createReportSchema,
    updateReportSchema,
    voteSchema,
    commentSchema,
} from "../middlewares/validateReports.js";

const router = express.Router();

/**
 * @route   GET /reports
 * @desc    Get all reports with filters and pagination
 * @access  Private
 */
router.get("/", authenticate, getAllReports);

/**
 * @route   GET /reports/nearby
 * @desc    Get nearby reports with geospatial query
 * @access  Private
 */
router.get("/nearby", authenticate, validate(getNearbySchema, "query"), getNearbyReports);

/**
 * @route   GET /reports/:id
 * @desc    Get single report by ID
 * @access  Private
 */
router.get("/:id", authenticate, getReportById);

/**
 * @route   POST /reports
 * @desc    Create a new report
 * @access  Private
 */
router.post("/", authenticate, validate(createReportSchema), createReport);

/**
 * @route   PATCH /reports/:id
 * @desc    Update report (time-limited)
 * @access  Private
 */
router.patch("/:id", authenticate, validate(updateReportSchema), updateReport);

/**
 * @route   DELETE /reports/:id
 * @desc    Delete/retract report
 * @access  Private
 */
router.delete("/:id", authenticate, deleteReport);

/**
 * @route   POST /reports/:id/vote
 * @desc    Vote on report (confirm/dispute)
 * @access  Private
 */
router.post("/:id/vote", authenticate, validate(voteSchema), voteReport);

/**
 * @route   POST /reports/:id/comment
 * @desc    Add comment to report
 * @access  Private
 */
router.post("/:id/comment", authenticate, validate(commentSchema), addComment);

/**
 * @route   GET /reports/:id/comments
 * @desc    Get comments for a report
 * @access  Private
 */
router.get("/:id/comments", authenticate, getReportComments);

/**
 * @route   POST /reports/:id/report-spam
 * @desc    Report a report as spam
 * @access  Private
 */
router.post("/:id/report-spam", authenticate, reportSpam);

/**
 * @route   PATCH /reports/:id/verify
 * @desc    Verify report (Moderator only)
 * @access  Private
 */
router.patch("/:id/verify", authenticate, verifyReport);

/**
 * @route   PATCH /reports/:id/reject
 * @desc    Reject report (Moderator only)
 * @access  Private
 */
router.patch("/:id/reject", authenticate, rejectReport);

/**
 * @route   PATCH /reports/:id/resolve
 * @desc    Resolve report (Moderator only)
 * @access  Private
 */
router.patch("/:id/resolve", authenticate, resolveReport);

export default router;
