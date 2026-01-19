import Report from "../db/schemas/Report.js";
import User from "../db/schemas/User.js";
import AuditLog from "../db/schemas/AuditLog.js";
import Notification from "../db/schemas/Notification.js";
import env from "../config/env.js";

/**
 * Get moderation dashboard summary
 * GET /moderation/summary
 */
export const getModerationSummary = async (req, res) => {
    try {
        const campusId = req.user.campusId;

        // Get counts
        const [pendingCount, todayReports, spamCount] = await Promise.all([
            Report.countDocuments({ campusId, status: "reported" }),
            Report.countDocuments({
                campusId,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            }),
            Report.countDocuments({ campusId, isSpam: true }),
        ]);

        // Get recent actions
        const recentActions = await AuditLog.find({
            action: { $in: ["verify_report", "invalidate_report", "resolve_report", "ban_user"] },
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("actorId", "name role");

        res.json({
            success: true,
            data: {
                summary: {
                    pendingCount,
                    todayReports,
                    spamCount,
                },
                recentActions,
            },
        });
    } catch (error) {
        console.error("Get moderation summary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get moderation summary",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Get reports for moderation
 * GET /moderation/reports
 */
export const getModerationReports = async (req, res) => {
    try {
        const {
            status = "reported",
            severity,
            category,
            limit = 50,
            page = 1,
        } = req.query;

        const query = { campusId: req.user.campusId };

        if (status) query.status = status;
        if (severity) query.severity = { $gte: parseInt(severity) };
        if (category) query.category = category;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reports = await Report.find(query)
            .sort({ severity: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate("reporterId", "name email")
            .populate("resolvedBy", "name role");

        const total = await Report.countDocuments(query);

        // Transform reports to moderator view
        const moderatorReports = reports.map((r) => r.toModeratorView());

        res.json({
            success: true,
            data: {
                reports: moderatorReports,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error("Get moderation reports error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get moderation reports",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Update report status (verify, invalidate, resolve)
 * PATCH /moderation/reports/:id
 */
export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, moderatorNotes, assignedTo } = req.body;

        const report = await Report.findById(id).select("+moderatorNotes");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Check campus access
        if (!report.campusId.equals(req.user.campusId) && req.user.role !== "super-admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied to this campus",
            });
        }

        const oldStatus = report.status;

        // Update fields
        if (status) {
            report.status = status;
            if (status === "resolved") {
                report.resolvedBy = req.userId;
                report.resolvedAt = new Date();
            }
        }

        if (moderatorNotes) {
            report.moderatorNotes = moderatorNotes;
        }

        if (assignedTo) {
            // Verify assignedTo is security staff
            const assignedUser = await User.findById(assignedTo);
            if (assignedUser && assignedUser.role === "security") {
                report.assignedTo = assignedTo;
            }
        }

        await report.save();

        // Log audit
        await AuditLog.logAction({
            actorId: req.userId,
            action: status === "verified" ? "verify_report" : status === "invalid" ? "invalidate_report" : "resolve_report",
            entityType: "report",
            entityId: report._id,
            changes: {
                before: { status: oldStatus },
                after: { status: report.status },
            },
        });

        // Notify reporter if status changed
        if (oldStatus !== report.status && !report.reporterId.equals(req.userId)) {
            await Notification.createNotification({
                userId: report.reporterId,
                reportId: report._id,
                type: "moderator_action",
                title: "Report Status Updated",
                message: `Your report has been ${status}`,
                priority: status === "resolved" ? "medium" : "low",
            });
        }

        // TODO: Emit socket event for real-time update
        // io.to(`campus:${req.user.campusId}`).emit('report_update', report);

        res.json({
            success: true,
            message: "Report updated successfully",
            data: { report: report.toModeratorView() },
        });
    } catch (error) {
        console.error("Update report status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update report",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Ban user
 * POST /moderation/ban-user
 */
export const banUser = async (req, res) => {
    try {
        const { userId, reason } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check campus access
        if (!user.campusId.equals(req.user.campusId) && req.user.role !== "super-admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        user.isBanned = true;
        user.bannedReason = reason || "Violation of community guidelines";
        user.bannedAt = new Date();
        await user.save();

        // Log audit
        await AuditLog.logAction({
            actorId: req.userId,
            action: "ban_user",
            entityType: "user",
            entityId: user._id,
            payload: { reason },
        });

        res.json({
            success: true,
            message: "User banned successfully",
        });
    } catch (error) {
        console.error("Ban user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to ban user",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Get audit logs
 * GET /moderation/audit
 */
export const getAuditLogs = async (req, res) => {
    try {
        const { reportId, limit = 100, page = 1 } = req.query;

        const query = {};
        if (reportId) query.reportId = reportId;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate("actorId", "name role")
            .populate("reportId", "title");

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get audit logs",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

export default {
    getModerationSummary,
    getModerationReports,
    updateReportStatus,
    banUser,
    getAuditLogs,
};
