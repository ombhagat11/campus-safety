import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../db/schemas/User.js";
import env from "../config/env.js";

/**
 * Clerk Authentication Middleware
 * Verifies Clerk session token and attaches user to request
 */
export const authenticateClerk = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify Clerk session token
        let clerkUser;
        try {
            // Verify the session token with Clerk
            const sessionClaims = await clerkClient.verifyToken(token, {
                secretKey: env.clerk.secretKey,
            });

            // Get full user details from Clerk
            clerkUser = await clerkClient.users.getUser(sessionClaims.sub);
        } catch (error) {
            console.error("Clerk token verification error:", error);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // Find or create user in our database
        let user = await User.findOne({ clerkId: clerkUser.id });

        if (!user) {
            // User exists in Clerk but not in our DB (shouldn't happen with webhooks)
            // Create user record
            const campusId = clerkUser.publicMetadata?.campusId;

            if (!campusId) {
                return res.status(400).json({
                    success: false,
                    message: "User not properly configured. Please complete registration.",
                });
            }

            user = await User.create({
                clerkId: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress,
                name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
                campusId,
                role: clerkUser.publicMetadata?.role || "student",
                isVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
                phone: clerkUser.phoneNumbers[0]?.phoneNumber,
            });
        }

        // Check if user is active and not banned
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated",
            });
        }

        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: `Account is banned${user.bannedReason ? `: ${user.bannedReason}` : ""}`,
            });
        }

        // Sync user data from Clerk if needed
        const needsUpdate =
            user.email !== clerkUser.emailAddresses[0]?.emailAddress ||
            user.name !== `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            user.isVerified !== (clerkUser.emailAddresses[0]?.verification?.status === "verified");

        if (needsUpdate) {
            user.email = clerkUser.emailAddresses[0]?.emailAddress;
            user.name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
            user.isVerified = clerkUser.emailAddresses[0]?.verification?.status === "verified";
            await user.save();
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;
        req.clerkUser = clerkUser;

        next();
    } catch (error) {
        console.error("Clerk authentication error:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

/**
 * Optional Clerk authentication - Attach user if token is provided, but don't require it
 */
export const optionalAuthenticateClerk = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // No token provided, continue without user
            return next();
        }

        const token = authHeader.substring(7);

        try {
            const sessionClaims = await clerkClient.verifyToken(token, {
                secretKey: env.clerk.secretKey,
            });

            const clerkUser = await clerkClient.users.getUser(sessionClaims.sub);
            const user = await User.findOne({ clerkId: clerkUser.id });

            if (user && user.isActive && !user.isBanned) {
                req.user = user;
                req.userId = user._id;
                req.clerkUser = clerkUser;
            }
        } catch (error) {
            // Invalid token, but continue without user
            console.log("Optional Clerk auth: Invalid token, continuing without user");
        }

        next();
    } catch (error) {
        console.error("Optional Clerk authentication error:", error);
        next();
    }
};

/**
 * Role-based authorization middleware (reused from original)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions",
                requiredRoles: roles,
                userRole: req.user.role,
            });
        }

        next();
    };
};

/**
 * Verify user belongs to specific campus
 * @param {string} campusIdField - Name of the field in req.params/body containing campusId
 */
export const verifyCampus = (campusIdField = "campusId") => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const campusId = req.params[campusIdField] || req.body[campusIdField];

        // Super admin can access any campus
        if (req.user.role === "super-admin") {
            return next();
        }

        // Check if user belongs to the campus
        if (req.user.campusId.toString() !== campusId) {
            return res.status(403).json({
                success: false,
                message: "Access denied to this campus",
            });
        }

        next();
    };
};

/**
 * Verify email is verified
 */
export const requireVerifiedEmail = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Email verification required",
        });
    }

    next();
};

export default {
    authenticateClerk,
    optionalAuthenticateClerk,
    requireRole,
    verifyCampus,
    requireVerifiedEmail,
};
