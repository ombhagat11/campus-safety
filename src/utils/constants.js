// Report Categories
export const REPORT_CATEGORIES = {
    THEFT: "theft",
    ASSAULT: "assault",
    HARASSMENT: "harassment",
    VANDALISM: "vandalism",
    SUSPICIOUS: "suspicious_activity",
    EMERGENCY: "emergency",
    FIRE: "fire",
    MEDICAL: "medical",
    OTHER: "other",
};

export const CATEGORY_LABELS = {
    [REPORT_CATEGORIES.THEFT]: "Theft",
    [REPORT_CATEGORIES.ASSAULT]: "Assault",
    [REPORT_CATEGORIES.HARASSMENT]: "Harassment",
    [REPORT_CATEGORIES.VANDALISM]: "Vandalism",
    [REPORT_CATEGORIES.SUSPICIOUS]: "Suspicious Activity",
    [REPORT_CATEGORIES.EMERGENCY]: "Emergency",
    [REPORT_CATEGORIES.FIRE]: "Fire Hazard",
    [REPORT_CATEGORIES.MEDICAL]: "Medical Emergency",
    [REPORT_CATEGORIES.OTHER]: "Other",
};

export const CATEGORY_ICONS = {
    [REPORT_CATEGORIES.THEFT]: "💰",
    [REPORT_CATEGORIES.ASSAULT]: "⚠️",
    [REPORT_CATEGORIES.HARASSMENT]: "🚫",
    [REPORT_CATEGORIES.VANDALISM]: "🔨",
    [REPORT_CATEGORIES.SUSPICIOUS]: "👁️",
    [REPORT_CATEGORIES.EMERGENCY]: "🚨",
    [REPORT_CATEGORIES.FIRE]: "🔥",
    [REPORT_CATEGORIES.MEDICAL]: "🏥",
    [REPORT_CATEGORIES.OTHER]: "📌",
};

export const CATEGORY_COLORS = {
    [REPORT_CATEGORIES.THEFT]: "#f59e0b",
    [REPORT_CATEGORIES.ASSAULT]: "#dc2626",
    [REPORT_CATEGORIES.HARASSMENT]: "#9333ea",
    [REPORT_CATEGORIES.VANDALISM]: "#ea580c",
    [REPORT_CATEGORIES.SUSPICIOUS]: "#0891b2",
    [REPORT_CATEGORIES.EMERGENCY]: "#dc2626",
    [REPORT_CATEGORIES.FIRE]: "#dc2626",
    [REPORT_CATEGORIES.MEDICAL]: "#ef4444",
    [REPORT_CATEGORIES.OTHER]: "#6b7280",
};

// Severity Levels
export const SEVERITY_LEVELS = {
    LOW: 1,
    MODERATE: 2,
    MEDIUM: 3,
    HIGH: 4,
    CRITICAL: 5,
};

export const SEVERITY_LABELS = {
    1: "Low",
    2: "Moderate",
    3: "Medium",
    4: "High",
    5: "Critical",
};

export const SEVERITY_COLORS = {
    1: "#10b981",
    2: "#3b82f6",
    3: "#f59e0b",
    4: "#f97316",
    5: "#dc2626",
};

// Report Status
export const REPORT_STATUS = {
    PENDING: "pending",
    VERIFIED: "verified",
    INVALID: "invalid",
    RESOLVED: "resolved",
};

export const STATUS_LABELS = {
    [REPORT_STATUS.PENDING]: "Pending Review",
    [REPORT_STATUS.VERIFIED]: "Verified",
    [REPORT_STATUS.INVALID]: "Invalid",
    [REPORT_STATUS.RESOLVED]: "Resolved",
};

export const STATUS_COLORS = {
    [REPORT_STATUS.PENDING]: "#f59e0b",
    [REPORT_STATUS.VERIFIED]: "#3b82f6",
    [REPORT_STATUS.INVALID]: "#6b7280",
    [REPORT_STATUS.RESOLVED]: "#10b981",
};

// User Roles
export const USER_ROLES = {
    STUDENT: "student",
    MODERATOR: "moderator",
    ADMIN: "admin",
    SECURITY: "security",
    SUPER_ADMIN: "super-admin",
};

// Notification Types
export const NOTIFICATION_TYPES = {
    NEW_REPORT_NEARBY: "new_report_nearby",
    REPORT_UPDATE: "report_update",
    COMMENT_REPLY: "comment_reply",
    MODERATOR_ACTION: "moderator_action",
    SYSTEM_ALERT: "system_alert",
};

// Map Settings
export const MAP_DEFAULTS = {
    CENTER: [-74.006, 40.7128], // New York (will be overridden by campus center)
    ZOOM: 15,
    MAX_ZOOM: 19,
    MIN_ZOOM: 11,
};

// Geolocation Settings
export const GEO_SETTINGS = {
    DEFAULT_RADIUS: 500, // meters
    MAX_RADIUS: 10000, // 10km
    HIGH_ACCURACY: true,
    TIMEOUT: 10000, // 10 seconds
    MAX_AGE: 60000, // 1 minute cache
};

// File Upload Settings
export const UPLOAD_SETTINGS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILES: 5,
    ACCEPTED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    ACCEPTED_EXTENSIONS: ".jpg,.jpeg,.png,.gif,.webp",
};

// Pagination
export const PAGINATION = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};

export default {
    REPORT_CATEGORIES,
    CATEGORY_LABELS,
    CATEGORY_ICONS,
    CATEGORY_COLORS,
    SEVERITY_LEVELS,
    SEVERITY_LABELS,
    SEVERITY_COLORS,
    REPORT_STATUS,
    STATUS_LABELS,
    STATUS_COLORS,
    USER_ROLES,
    NOTIFICATION_TYPES,
    MAP_DEFAULTS,
    GEO_SETTINGS,
    UPLOAD_SETTINGS,
    PAGINATION,
};
