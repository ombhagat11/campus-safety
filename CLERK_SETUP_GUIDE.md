# Clerk Authentication Setup Guide

## Overview
This guide will help you set up Clerk authentication for the Campus Safety application.

## Prerequisites
- A Clerk account (sign up at https://clerk.com)
- Node.js and npm installed
- MongoDB instance running

## Step 1: Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Click "Add application"
3. Name it "Campus Safety"
4. Select authentication methods:
   - ✅ Email
   - ✅ Google (optional)
   - ✅ GitHub (optional)
5. Click "Create application"

## Step 2: Get Your API Keys

From your Clerk dashboard:

1. Go to "API Keys" in the sidebar
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## Step 3: Configure Backend Environment

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create or update `.env` file:
   ```bash
   # Clerk Authentication
   CLERK_SECRET_KEY=sk_test_your_actual_secret_key
   CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

## Step 4: Configure Frontend Environment

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create or update `.env` file:
   ```bash
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
   VITE_API_URL=http://localhost:5000
   ```

## Step 5: Set Up Clerk Webhooks

Webhooks sync user data between Clerk and your MongoDB database.

### Development (using ngrok or similar):

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

3. In a new terminal, expose your local server:
   ```bash
   ngrok http 5000
   ```

4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

5. In Clerk Dashboard:
   - Go to "Webhooks" → "Add Endpoint"
   - Endpoint URL: `https://abc123.ngrok.io/webhooks/clerk`
   - Subscribe to events:
     - ✅ user.created
     - ✅ user.updated
     - ✅ user.deleted
   - Click "Create"

6. Copy the "Signing Secret" and add it to your backend `.env`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_your_signing_secret
   ```

### Production:

1. Use your production backend URL:
   ```
   https://your-api-domain.com/webhooks/clerk
   ```

2. Follow the same webhook setup steps above

## Step 6: Configure User Metadata

In Clerk Dashboard, configure custom metadata fields:

1. Go to "User & Authentication" → "Metadata"
2. Add public metadata fields:
   - `campusCode` (string) - Required for registration
   - `campusId` (string) - Set by webhook
   - `role` (string) - Default: "student"

## Step 7: Customize Sign-Up Flow

1. Go to "User & Authentication" → "Email, Phone, Username"
2. Configure required fields:
   - ✅ Email address (required)
   - ✅ First name (required)
   - ✅ Last name (required)
   - ✅ Phone number (optional)

## Step 8: Test the Integration

### Backend Test:

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the console for:
   ```
   ✅ MongoDB connected
   ✅ Server running on port 5000
   ```

### Frontend Test:

1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open http://localhost:5173

3. Test registration:
   - Go to `/register`
   - Enter a campus code (e.g., "UCLA2024")
   - Complete Clerk sign-up form
   - Check MongoDB for new user record

4. Test login:
   - Go to `/login`
   - Sign in with your credentials
   - Should redirect to `/app/dashboard`

## Step 9: Verify Webhook Sync

1. After registration, check your MongoDB:
   ```javascript
   db.users.findOne({ email: "your-test-email@example.com" })
   ```

2. Verify fields:
   - ✅ `clerkId` is populated
   - ✅ `campusId` is set
   - ✅ `role` is "student"
   - ✅ `isVerified` matches Clerk status

## Troubleshooting

### "Missing Clerk Publishable Key" Error
- Ensure `.env` files are created in both frontend and backend
- Restart development servers after adding environment variables

### Webhook Not Receiving Events
- Check ngrok is running and URL is correct
- Verify webhook signing secret matches `.env`
- Check backend logs for webhook errors

### User Not Created in Database
- Verify webhook endpoint is accessible
- Check backend logs for errors
- Ensure MongoDB is running and connected

### Authentication Fails
- Clear browser localStorage
- Check Clerk dashboard for user status
- Verify API client is initialized with Clerk token

## Security Checklist

- [ ] Never commit `.env` files to git
- [ ] Use different Clerk apps for dev/staging/production
- [ ] Rotate webhook secrets periodically
- [ ] Enable two-factor authentication in Clerk dashboard
- [ ] Set up rate limiting for authentication endpoints
- [ ] Monitor Clerk dashboard for suspicious activity

## Campus Code Management

### Creating Campus Codes

Campus codes are validated during registration. To create a campus:

1. Use the admin panel or run a script:
   ```javascript
   // In MongoDB or via API
   db.campuses.insertOne({
     name: "University of California, Los Angeles",
     code: "UCLA2024",
     location: {
       type: "Point",
       coordinates: [-118.4452, 34.0689]
     }
   })
   ```

2. Share the code with your campus community

### Testing Campus Codes

For development, seed some test campuses:

```bash
cd backend
node src/seed.js
```

## Next Steps

1. ✅ Clerk authentication is now set up!
2. Configure role-based access control
3. Set up email notifications
4. Customize Clerk UI theme to match your brand
5. Add OAuth providers (Google, GitHub, etc.)
6. Implement multi-factor authentication

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Node SDK](https://clerk.com/docs/references/nodejs/overview)
- [Webhook Events](https://clerk.com/docs/integrations/webhooks/overview)

## Support

If you encounter issues:
1. Check Clerk dashboard logs
2. Review backend console output
3. Inspect browser console for errors
4. Verify all environment variables are set correctly
