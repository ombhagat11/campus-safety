import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "../src/routes/auth.routes.js";
import reportsRoutes from "../src/routes/reports.routes.js";
import usersRoutes from "../src/routes/users.routes.js";
import moderationRoutes from "../src/routes/moderation.routes.js";
import adminRoutes from "../src/routes/admin.routes.js";
import publicRoutes from "../src/routes/public.routes.js";

// Import middleware
import { errorHandler, notFoundHandler } from "../src/middlewares/errorHandler.js";
import { apiLimiter, authLimiter, reportLimiter } from "../src/middlewares/rateLimiter.js";

// Import database
import connectDB from "../src/db/connection.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Connect to database (with caching for serverless)
const connectToDatabase = async () => {
    try {
        await connectDB();
    } catch (err) {
        console.error("Database connection error in serverless:", err);
    }
};

// Global DB connection middleware
app.use(async (req, res, next) => {
    await connectToDatabase();
    next();
});

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "Campus Safety API",
        version: "1.0.0",
        deployment: "vercel-serverless",
        status: "running",
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
        deployment: "vercel-serverless",
    });
});

// API routes with rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/reports", reportLimiter, reportsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

// Legacy routes without /api prefix for backward compatibility
app.use("/auth", authLimiter, authRoutes);
app.use("/reports", reportLimiter, reportsRoutes);
app.use("/users", usersRoutes);
app.use("/moderation", moderationRoutes);
app.use("/admin", adminRoutes);
app.use("/public", publicRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
