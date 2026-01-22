import rateLimit from "express-rate-limit";
import env from "../config/env.js";

/**
 * Rate limiter store configuration
 * In production with Redis, you should use rate-limit-redis
 * For now, using memory store with warning
 */
const getLimiterStore = () => {
    if (env.nodeEnv === "production" && !process.env.VERCEL) {
        console.warn("⚠️  Using memory store for rate limiting. Consider using Redis in production.");
    }
    // Default memory store - works for Vercel serverless
    return undefined;
};

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    store: getLimiterStore(),
});

/**
 * Auth rate limiter (stricter)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: "Too many login attempts, please try again after 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    store: getLimiterStore(),
});

/**
 * Report creation rate limiter
 */
export const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: env.nodeEnv === "production" ? 10 : 1000, // Stricter in production
    message: "You have reached the maximum number of reports per hour. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    store: getLimiterStore(),
});

/**
 * Password reset rate limiter
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Max 3 password reset requests per hour
    message: "Too many password reset attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    store: getLimiterStore(),
});

/**
 * Email verification rate limiter
 */
export const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Max 5 verification emails per hour
    message: "Too many verification requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    store: getLimiterStore(),
});

export default {
    apiLimiter,
    authLimiter,
    reportLimiter,
    passwordResetLimiter,
    verificationLimiter,
};
