import dotenv from "dotenv";

dotenv.config();

const env = {
    // Server
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "5000", 10),

    // Database
    mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/campus-safety",
    mongoTestUri: process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/campus-safety-test",

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || "dev-secret-key",
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
    },

    // Rate Limiting
    rateLimit: {
        reportsPerHour: parseInt(process.env.RATE_LIMIT_REPORTS_PER_HOUR || "5", 10),
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "3600000", 10),
    },

    // Notifications
    notifications: {
        defaultRadius: parseInt(process.env.DEFAULT_NOTIFICATION_RADIUS || "500", 10),
        minSeverityForPush: parseInt(process.env.MINIMUM_SEVERITY_FOR_PUSH || "4", 10),
    },

    // Frontend
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

    // Admin
    admin: {
        requireModeratorsBeforePublicSignup: process.env.REQUIRE_MODERATORS_BEFORE_PUBLIC_SIGNUP === "true",
        minimumModeratorsCount: parseInt(process.env.MINIMUM_MODERATORS_COUNT || "3", 10),
    },
};

// Validation in production
if (env.nodeEnv === "production") {
    const required = [
        "MONGODB_URI",
        "JWT_SECRET"
    ];

    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
}

export default env;
