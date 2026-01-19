import Report from "../db/schemas/Report.js";
import Comment from "../db/schemas/Comment.js";
import AuditLog from "../db/schemas/AuditLog.js";
import Notification from "../db/schemas/Notification.js";
import env from "../config/env.js";

/**
 * Get all reports (with filters and pagination)
 * GET /reports?page=1&limit=20&status=&category=&severity=&search=
 */
export const getAllReports = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            category,
            severity,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {
            campusId: req.user.campusId
        };

        console.log('--- GET ALL REPORTS ---');
        console.log('User:', req.user.email);
        console.log('User Campus ID:', req.user.campusId);

        if (status) query.status = status;
        if (category) {
            const categories = category.split(',');
            if (categories.length > 1) {
                query.category = { $in: categories };
            } else {
                query.category = category;
            }
        }
        if (severity) query.severity = parseInt(severity);
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Final Query:', JSON.stringify(query));

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Get reports
        const reports = await Report.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limitNum)
            .populate('reporterId', 'name')
            .lean();

        // Get total count
        const total = await Report.countDocuments(query);

        // Transform reports based on user permissions
        const transformedReports = reports.map((report) => {
            if (report.isAnonymous && !req.user.canModerate()) {
                delete report.reporterId;
            }
            return report;
        });

        res.json({
            success: true,
            data: {
                reports: transformedReports,
                pagination: {
                    page: parseInt(page),
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        console.error("Get all reports error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get reports",
            error: env.nodeEnv === "development" ? error.message : undefined
        });
    }
};

/**
 * Get nearby reports
 * GET /reports/nearby?lat=&lon=&radius=&category=&severity=&status=&since=
 */
export const getNearbyReports = async (req, res) => {
    try {
        const {
            lat,
            lon,
            radius = 1000, // default 1km
            category,
            severity,
            status,
            since,
            limit = 100,
        } = req.query;

        // Validate coordinates
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required",
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coordinates",
            });
        }

        // Build filters
        const filters = {};
        if (category) filters.category = category;
        if (severity) filters.severity = parseInt(severity);
        if (status) filters.status = status;
        if (since) filters.since = since;

        // Get reports using geospatial query
        const reports = await Report.findNearby(
            req.user.campusId,
            longitude,
            latitude,
            parseInt(radius),
            filters
        ).limit(parseInt(limit));

        // Transform reports based on user permissions
        const transformedReports = reports.map((report) => {
            if (req.user.canModerate()) {
                return report.toModeratorView();
            }
            return report.toObject({ virtuals: true });
        });

        res.json({
            success: true,
            data: {
                reports: transformedReports,
                count: transformedReports.length,
                query: {
                    latitude,
                    longitude,
                    radius: parseInt(radius),
                    filters,
                },
            },
        });
    } catch (error) {
        console.error("Get nearby reports error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get nearby reports",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Get single report by ID
 * GET /reports/:id
 */
export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id)
            .populate("reporterId", "name")
            .populate("resolvedBy", "name role");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Increment view count
        await report.incrementViews();

        // Transform based on user permissions
        const reportData = req.user.canModerate()
            ? report.toModeratorView()
            : report.toObject({ virtuals: true });

        res.json({
            success: true,
            data: { report: reportData },
        });
    } catch (error) {
        console.error("Get report by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get report",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Create new report
 * POST /reports
 */
export const createReport = async (req, res) => {
    try {
        console.log('=== CREATE REPORT REQUEST ===');
        console.log('User ID:', req.userId);
        console.log('User:', req.user?.email);
        console.log('Campus ID:', req.user?.campusId);
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        const {
            category,
            severity,
            title,
            description,
            location,
            mediaUrls = [],
            isAnonymous = false,
        } = req.body;

        // Validate location
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            console.error('❌ Invalid location:', location);
            return res.status(400).json({
                success: false,
                message: "Valid location (GeoJSON Point) is required",
            });
        }

        console.log('✓ Validation passed');
        console.log('Creating report with data:', {
            reporterId: req.userId,
            campusId: req.user.campusId,
            category,
            severity,
            title,
            description,
            location,
            mediaUrls,
            isAnonymous
        });

        // TODO: Implement rate limiting check
        // For now, basic rate limit checking would go here

        // Create report
        const report = await Report.create({
            reporterId: req.userId,
            campusId: req.user.campusId,
            category,
            severity,
            title,
            description,
            location: {
                type: "Point",
                coordinates: location.coordinates, // [longitude, latitude]
            },
            mediaUrls,
            isAnonymous,
        });

        console.log('✓ Report created successfully:', report._id);

        // Log audit
        await AuditLog.logAction({
            actorId: req.userId,
            action: "create_report",
            entityType: "report",
            entityId: report._id,
            payload: { category, severity, isAnonymous },
        });

        // TODO: Emit socket event for real-time update
        // io.to(`campus:${req.user.campusId}`).emit('new_report', report);

        // TODO: Queue notification job if severity >= threshold
        if (severity >= env.notifications.minSeverityForPush) {
            // Queue notification fanout job
            console.log(`📢 High severity report created: ${report._id} - queuing notifications`);
        }

        res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: { report: report.toObject({ virtuals: true }) },
        });
    } catch (error) {
        console.error("❌ Create report error:", error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: "Failed to create report",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Update report (time-limited editing)
 * PATCH /reports/:id
 */
export const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, severity, mediaUrls } = req.body;

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Check if user can edit
        if (!report.canEdit(req.userId)) {
            return res.status(403).json({
                success: false,
                message: "Cannot edit report (time limit exceeded or not owner)",
            });
        }

        // Store old values for audit
        const oldValues = {
            title: report.title,
            description: report.description,
            category: report.category,
            severity: report.severity,
        };

        // Update fields
        if (title) report.title = title;
        if (description) report.description = description;
        if (category) report.category = category;
        if (severity) report.severity = severity;
        if (mediaUrls) report.mediaUrls = mediaUrls;

        report.isEdited = true;
        report.editedAt = new Date();

        // Add to edit history
        report.editHistory.push({
            editedAt: new Date(),
            changes: {
                title: title || report.title,
                description: description || report.description,
                category: category || report.category,
                severity: severity || report.severity,
            },
        });

        await report.save();

        // Log audit
        await AuditLog.logAction({
            actorId: req.userId,
            action: "edit_report",
            entityType: "report",
            entityId: report._id,
            changes: {
                before: oldValues,
                after: {
                    title: report.title,
                    description: report.description,
                    category: report.category,
                    severity: report.severity,
                },
            },
        });

        res.json({
            success: true,
            message: "Report updated successfully",
            data: { report: report.toObject({ virtuals: true }) },
        });
    } catch (error) {
        console.error("Update report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update report",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Delete/retract report
 * DELETE /reports/:id
 */
export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Check if user owns the report or is admin
        if (!report.reporterId.equals(req.userId) && !req.user.canAdmin()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own reports",
            });
        }

        // Soft delete - change status to invalid
        report.status = "invalid";
        await report.save();

        // Log audit
        await AuditLog.logAction({
            actorId: req.userId,
            action: "delete_report",
            entityType: "report",
            entityId: report._id,
        });

        res.json({
            success: true,
            message: "Report deleted successfully",
        });
    } catch (error) {
        console.error("Delete report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete report",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Vote on report (confirm/dispute)
 * POST /reports/:id/vote
 */
export const voteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { vote } = req.body; // "confirm", "dispute" or null to remove

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Handle vote removal
        if (!vote) {
            await report.removeVote(req.userId);
        } else {
            if (!["confirm", "dispute"].includes(vote)) {
                return res.status(400).json({
                    success: false,
                    message: "Vote must be 'confirm' or 'dispute'",
                });
            }
            // Add/Change vote
            await report.addVote(req.userId, vote);
        }

        // Log audit
        await AuditLog.logAction({
            actorId: req.userId,
            action: "vote_report",
            entityType: "report",
            entityId: report._id,
            payload: { vote },
        });

        res.json({
            success: true,
            message: "Vote recorded successfully",
            data: {
                confirmCount: report.confirmCount,
                disputeCount: report.disputeCount,
                netVotes: report.netVotes,
            },
        });
    } catch (error) {
        console.error("Vote report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to vote",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Add comment to report
 * POST /reports/:id/comment
 */
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isAnonymous = false } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Create comment
        const comment = await Comment.create({
            reportId: id,
            userId: req.userId,
            content: content.trim(),
            isAnonymous,
        });

        // Update report comment count
        report.commentsCount += 1;
        await report.save();

        // Notify report owner (if not commenting on own report)
        if (!report.reporterId.equals(req.userId)) {
            await Notification.createNotification({
                userId: report.reporterId,
                reportId: id,
                type: "comment_reply",
                title: "New comment on your report",
                message: `Someone commented on your report: ${report.title}`,
                data: { commentId: comment._id },
                priority: "low",
            });
        }

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: { comment },
        });
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add comment",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Get comments for a report
 * GET /reports/:id/comments
 */
export const getReportComments = async (req, res) => {
    try {
        const { id } = req.params;

        const comments = await Comment.findByReport(id);

        res.json({
            success: true,
            data: {
                comments,
                count: comments.length,
            },
        });
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get comments",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Report spam
 * POST /reports/:id/report-spam
 */
export const reportSpam = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Add user to spam reports
        if (!report.spamReports.includes(req.userId)) {
            report.spamReports.push(req.userId);
            await report.save();
        }

        // Log audit
        await AuditLog.logAction({
            actorId: req.userId,
            action: "report_spam",
            entityType: "report",
            entityId: report._id,
        });

        // TODO: Auto-mark as spam if threshold reached (e.g., 5 reports)
        if (report.spamReports.length >= 5 && !report.isSpam) {
            report.isSpam = true;
            report.status = "spam";
            await report.save();
        }

        res.json({
            success: true,
            message: "Spam report submitted successfully",
        });
    } catch (error) {
        console.error("Report spam error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to report spam",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Verify report (Moderator action)
 * PATCH /reports/:id/verify
 */
export const verifyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        report.status = "verified";
        if (reason) report.resolutionDetails = reason;
        await report.save();

        res.json({
            success: true,
            message: "Report verified successfully",
            data: { report }
        });
    } catch (error) {
        console.error("Verify report error:", error);
        res.status(500).json({ success: false, message: "Failed to verify report" });
    }
};

/**
 * Reject report (Moderator action)
 * PATCH /reports/:id/reject
 */
export const rejectReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        report.status = "invalid";
        report.resolutionDetails = reason || "This report was rejected by the moderation team.";
        await report.save();

        res.json({
            success: true,
            message: "Report rejected as invalid",
            data: { report }
        });
    } catch (error) {
        console.error("Reject report error:", error);
        res.status(500).json({ success: false, message: "Failed to reject report" });
    }
};

/**
 * Resolve report (Moderator action)
 * PATCH /reports/:id/resolve
 */
export const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolutionDetails } = req.body;
        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        report.status = "resolved";
        report.resolutionDetails = resolutionDetails || "Issue resolved by moderation team.";
        report.resolvedAt = new Date();
        await report.save();

        res.json({
            success: true,
            message: "Report resolved successfully",
            data: { report }
        });
    } catch (error) {
        console.error("Resolve report error:", error);
        res.status(500).json({ success: false, message: "Failed to resolve report" });
    }
};

export default {
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
};
