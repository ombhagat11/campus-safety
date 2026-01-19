import express from "express";
import { handleClerkWebhook } from "../controllers/clerk-webhook.controller.js";

const router = express.Router();

/**
 * Clerk Webhook Endpoint
 * POST /webhooks/clerk
 * 
 * This endpoint receives webhooks from Clerk to sync user data
 * No authentication required - verified via webhook signature
 */
router.post("/clerk", express.raw({ type: "application/json" }), handleClerkWebhook);

export default router;
