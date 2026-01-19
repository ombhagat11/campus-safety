import User from "../db/schemas/User.js";
import Campus from "../db/schemas/Campus.js";
import AuditLog from "../db/schemas/AuditLog.js";
import { hashPassword, comparePassword, validatePasswordStrength } from "../utils/password.js";
import {
    generateTokenPair,
    verifyToken,
    generateVerificationToken,
    generateResetToken,
    verifySpecialToken,
} from "../utils/jwt.js";
import env from "../config/env.js";

/**
 * Register a new user
 * POST /auth/register
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, campusCode, phone } = req.body;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: "Password does not meet requirements",
                errors: passwordValidation.errors,
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        // Find campus by code
        const campus = await Campus.findByCode(campusCode);
        if (!campus) {
            return res.status(404).json({
                success: false,
                message: "Invalid campus code",
            });
        }

        // Check moderation requirement
        if (env.admin.requireModeratorsBeforePublicSignup) {
            if (campus.stats.totalModerators < env.admin.minimumModeratorsCount) {
                return res.status(403).json({
                    success: false,
                    message: "Campus is not yet accepting student registrations. Please contact your campus administrator.",
                });
            }
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user
        const user = await User.create({
            name,
            email,
            passwordHash,
            campusId: campus._id,
            phone,
            role: "student", // Default role
            verificationToken,
            verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        // Update campus user count
        await campus.incrementUserCount();

        // Log audit
        await AuditLog.logAction({
            actorId: user._id,
            action: "create_report",
            entityType: "user",
            entityId: user._id,
            payload: { email, campusId: campus._id },
        });

        // TODO: Send verification email
        console.log(`📧 Verification token for ${email}: ${verificationToken}`);

        // Generate tokens
        const tokens = generateTokenPair(user);

        res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email.",
            data: {
                user: user.toSafeObject(),
                ...tokens,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Login user
 * POST /auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: `Account is banned${user.bannedReason ? `: ${user.bannedReason}` : ""}`,
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated",
            });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // Generate tokens
        const tokens = generateTokenPair(user);

        // Remove password from user object
        const userObject = user.toObject();
        delete userObject.passwordHash;

        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: userObject,
                ...tokens,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Refresh access token
 * POST /auth/refresh
 */
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyToken(refreshToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || "Invalid refresh token",
            });
        }

        // Check token type
        if (decoded.type !== "refresh") {
            return res.status(401).json({
                success: false,
                message: "Invalid token type",
            });
        }

        // Get user
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive || user.isBanned) {
            return res.status(401).json({
                success: false,
                message: "Invalid user",
            });
        }

        // Generate new tokens
        const tokens = generateTokenPair(user);

        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: tokens,
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({
            success: false,
            message: "Token refresh failed",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Request password reset
 * POST /auth/forgot
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: "If the email exists, a password reset link has been sent",
            });
        }

        // Generate reset token
        const resetToken = generateResetToken(user._id);

        // Save token to user
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // TODO: Send reset email
        const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;
        console.log(`🔐 Password reset link for ${email}: ${resetUrl}`);

        res.json({
            success: true,
            message: "If the email exists, a password reset link has been sent",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Password reset request failed",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Reset password with token
 * POST /auth/reset
 */
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: "Password does not meet requirements",
                errors: passwordValidation.errors,
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = verifySpecialToken(token, "password-reset");
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        // Find user with reset token
        const user = await User.findOne({
            _id: decoded.id,
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        }).select("+resetToken +resetTokenExpiry");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        // Hash new password
        const passwordHash = await hashPassword(password);

        // Update password and clear reset token
        user.passwordHash = passwordHash;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Password reset failed",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Verify email with token
 * POST /auth/verify-email
 */
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        // Verify token
        let decoded;
        try {
            decoded = verifySpecialToken(token, "email-verification");
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token",
            });
        }

        // Find user
        const user = await User.findOne({
            _id: decoded.id,
            verificationToken: token,
            verificationTokenExpiry: { $gt: new Date() },
        }).select("+verificationToken +verificationTokenExpiry");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token",
            });
        }

        // Update user
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Verify email error:", error);
        res.status(500).json({
            success: false,
            message: "Email verification failed",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Get current user
 * GET /auth/me
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("campusId", "name code");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: { user: user.toSafeObject() },
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get user",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

export default {
    register,
    login,
    refresh,
    forgotPassword,
    resetPassword,
    verifyEmail,
    getMe,
};
