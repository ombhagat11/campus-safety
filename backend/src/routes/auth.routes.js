import express from "express";
import {
    register,
    login,
    refresh,
    forgotPassword,
    resetPassword,
    verifyEmail,
    getMe,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import {
    validate,
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from "../middlewares/validate.js";

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validate(registerSchema), register);

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validate(loginSchema), login);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", validate(refreshTokenSchema), refresh);

/**
 * @route   POST /auth/forgot
 * @desc    Request password reset
 * @access  Public
 */
router.post("/forgot", validate(forgotPasswordSchema), forgotPassword);

/**
 * @route   POST /auth/reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset", validate(resetPasswordSchema), resetPassword);

/**
 * @route   POST /auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

/**
 * @route   GET /auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/me", authenticate, getMe);

export default router;
