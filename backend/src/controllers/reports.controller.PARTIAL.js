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

        if (status) query.status = status;
        if (category) query.category = category;
        if (severity) query.severity = parseInt(severity);
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

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
            return res.status(400).json({
                success: false,
                message: "Valid location (GeoJSON Point) is required",
            });
        }

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
        console.error("Create report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create report",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

// ... rest of the file remains the same (updateReport, deleteReport, voteReport, addComment, getReportComments, reportSpam)
