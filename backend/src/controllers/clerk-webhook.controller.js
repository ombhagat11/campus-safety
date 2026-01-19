import { Webhook } from "svix";
import User from "../db/schemas/User.js";
import Campus from "../db/schemas/Campus.js";
import AuditLog from "../db/schemas/AuditLog.js";
import env from "../config/env.js";

/**
 * Clerk Webhook Handler
 * Syncs user data between Clerk and MongoDB
 * POST /webhooks/clerk
 */
export const handleClerkWebhook = async (req, res) => {
    try {
        // Get the headers and body
        const svix_id = req.headers["svix-id"];
        const svix_timestamp = req.headers["svix-timestamp"];
        const svix_signature = req.headers["svix-signature"];

        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing svix headers",
            });
        }

        // Get the body
        const payload = req.body;

        // Verify the webhook signature
        const wh = new Webhook(env.clerk.webhookSecret);
        let evt;

        try {
            evt = wh.verify(JSON.stringify(payload), {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err) {
            console.error("Webhook signature verification failed:", err);
            return res.status(400).json({
                success: false,
                message: "Invalid signature",
            });
        }

        // Handle the webhook event
        const eventType = evt.type;
        const userData = evt.data;

        console.log(`📨 Clerk webhook received: ${eventType}`);

        switch (eventType) {
            case "user.created":
                await handleUserCreated(userData);
                break;

            case "user.updated":
                await handleUserUpdated(userData);
                break;

            case "user.deleted":
                await handleUserDeleted(userData);
                break;

            default:
                console.log(`Unhandled webhook event: ${eventType}`);
        }

        res.status(200).json({
            success: true,
            message: "Webhook processed",
        });
    } catch (error) {
        console.error("Clerk webhook error:", error);
        res.status(500).json({
            success: false,
            message: "Webhook processing failed",
            error: env.nodeEnv === "development" ? error.message : undefined,
        });
    }
};

/**
 * Handle user.created event
 */
async function handleUserCreated(clerkUser) {
    try {
        // Extract campus code from metadata
        const campusCode = clerkUser.publicMetadata?.campusCode;
        const role = clerkUser.publicMetadata?.role || "student";

        if (!campusCode) {
            console.error("User created without campus code:", clerkUser.id);
            return;
        }

        // Find campus
        const campus = await Campus.findByCode(campusCode);
        if (!campus) {
            console.error("Invalid campus code:", campusCode);
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ clerkId: clerkUser.id });
        if (existingUser) {
            console.log("User already exists:", clerkUser.id);
            return;
        }

        // Create user in our database
        const user = await User.create({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Unknown",
            campusId: campus._id,
            role,
            isVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
            phone: clerkUser.phoneNumbers[0]?.phoneNumber,
            profileImage: clerkUser.imageUrl,
        });

        // Update campus user count
        await campus.incrementUserCount();

        // Log audit
        await AuditLog.logAction({
            actorId: user._id,
            action: "user_created",
            entityType: "user",
            entityId: user._id,
            payload: {
                email: user.email,
                campusId: campus._id,
                clerkId: clerkUser.id,
            },
        });

        console.log(`✅ User created in DB: ${user.email}`);
    } catch (error) {
        console.error("Error handling user.created:", error);
    }
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(clerkUser) {
    try {
        // Find user in our database
        const user = await User.findOne({ clerkId: clerkUser.id });

        if (!user) {
            console.log("User not found in DB, creating:", clerkUser.id);
            // User might have been created before webhook was set up
            await handleUserCreated(clerkUser);
            return;
        }

        // Update user data
        const updates = {
            email: clerkUser.emailAddresses[0]?.emailAddress,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || user.name,
            isVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
            phone: clerkUser.phoneNumbers[0]?.phoneNumber,
            profileImage: clerkUser.imageUrl,
        };

        // Update role if changed in Clerk metadata
        if (clerkUser.publicMetadata?.role && clerkUser.publicMetadata.role !== user.role) {
            updates.role = clerkUser.publicMetadata.role;
        }

        // Apply updates
        Object.assign(user, updates);
        await user.save();

        console.log(`✅ User updated in DB: ${user.email}`);
    } catch (error) {
        console.error("Error handling user.updated:", error);
    }
}

/**
 * Handle user.deleted event
 */
async function handleUserDeleted(clerkUser) {
    try {
        // Find and soft delete user
        const user = await User.findOne({ clerkId: clerkUser.id });

        if (!user) {
            console.log("User not found in DB:", clerkUser.id);
            return;
        }

        // Soft delete (deactivate)
        user.isActive = false;
        await user.save();

        // Log audit
        await AuditLog.logAction({
            actorId: user._id,
            action: "user_deleted",
            entityType: "user",
            entityId: user._id,
            payload: {
                clerkId: clerkUser.id,
                email: user.email,
            },
        });

        console.log(`✅ User deactivated in DB: ${user.email}`);
    } catch (error) {
        console.error("Error handling user.deleted:", error);
    }
}

export default {
    handleClerkWebhook,
};
