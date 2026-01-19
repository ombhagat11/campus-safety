# Clerk Integration Checklist

Use this checklist to ensure everything is set up correctly.

## ✅ Pre-Setup

- [ ] Node.js and npm installed
- [ ] MongoDB running
- [ ] Git repository initialized
- [ ] Both backend and frontend dependencies installed

## 🔐 Clerk Account Setup

- [ ] Created account at https://clerk.com
- [ ] Created new application named "Campus Safety"
- [ ] Enabled email authentication
- [ ] (Optional) Enabled OAuth providers (Google, GitHub)
- [ ] Copied Secret Key (sk_test_...)
- [ ] Copied Publishable Key (pk_test_...)

## ⚙️ Backend Configuration

- [ ] Created `backend/.env` file
- [ ] Added `CLERK_SECRET_KEY`
- [ ] Added `CLERK_PUBLISHABLE_KEY`
- [ ] Added `CLERK_WEBHOOK_SECRET` (after webhook setup)
- [ ] Verified MongoDB connection string
- [ ] Installed Clerk packages (`@clerk/clerk-sdk-node`, `svix`)

## 🎨 Frontend Configuration

- [ ] Created `frontend/.env` file
- [ ] Added `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] Added `VITE_API_URL=http://localhost:5000`
- [ ] Installed Clerk package (`@clerk/clerk-react`)

## 🔗 Webhook Setup (Development)

- [ ] Installed ngrok: `npm install -g ngrok`
- [ ] Started backend server: `npm run dev`
- [ ] Started ngrok: `ngrok http 5000`
- [ ] Copied ngrok URL (e.g., https://abc123.ngrok.io)
- [ ] Went to Clerk Dashboard → Webhooks
- [ ] Added endpoint: `https://abc123.ngrok.io/webhooks/clerk`
- [ ] Subscribed to events:
  - [ ] user.created
  - [ ] user.updated
  - [ ] user.deleted
- [ ] Copied Signing Secret
- [ ] Added to backend `.env` as `CLERK_WEBHOOK_SECRET`
- [ ] Restarted backend server

## 🗄️ Database Setup

- [ ] MongoDB is running
- [ ] Connected to database
- [ ] Ran seed script: `node src/seed.js`
- [ ] Verified campuses collection has data
- [ ] Noted campus codes for testing

## 🧪 Testing

### Registration Test
- [ ] Started backend: `npm run dev`
- [ ] Started frontend: `npm run dev`
- [ ] Opened http://localhost:5173
- [ ] Clicked "Register"
- [ ] Entered campus code
- [ ] Filled out Clerk sign-up form
- [ ] Received verification email
- [ ] Verified email
- [ ] Checked MongoDB for new user record
- [ ] Verified user has `clerkId` field
- [ ] Verified user has correct `campusId`

### Login Test
- [ ] Went to http://localhost:5173/login
- [ ] Entered credentials
- [ ] Successfully logged in
- [ ] Redirected to dashboard
- [ ] Checked browser console for errors

### API Test
- [ ] Made authenticated API request
- [ ] Verified Clerk token in request headers
- [ ] Received successful response
- [ ] Checked backend logs for token verification

### Map Test (Should Still Work)
- [ ] Went to map page
- [ ] Map loads correctly
- [ ] Markers display
- [ ] Click on marker shows popup
- [ ] Location services work

## 🔒 Security Checklist

- [ ] `.env` files added to `.gitignore`
- [ ] Never committed API keys to git
- [ ] Using test keys for development
- [ ] Webhook secret is secure
- [ ] HTTPS enabled (production)
- [ ] CORS configured correctly

## 📊 Clerk Dashboard Verification

- [ ] Logged into Clerk dashboard
- [ ] Checked Users section - test user appears
- [ ] Checked Webhooks - events delivered successfully
- [ ] Reviewed logs for errors
- [ ] Verified user metadata (campusCode, role)

## 🚀 Production Checklist (When Ready)

- [ ] Created production Clerk application
- [ ] Updated environment variables with production keys
- [ ] Configured production webhook URL
- [ ] Tested in staging environment
- [ ] Enabled rate limiting
- [ ] Set up monitoring
- [ ] Configured email templates
- [ ] Customized Clerk UI theme
- [ ] Enabled 2FA for admins
- [ ] Reviewed security settings

## 🐛 Troubleshooting

If something doesn't work, check:

- [ ] All environment variables are set
- [ ] Servers restarted after env changes
- [ ] ngrok is running (development)
- [ ] Webhook URL is correct in Clerk dashboard
- [ ] MongoDB is connected
- [ ] No errors in backend console
- [ ] No errors in browser console
- [ ] Clerk dashboard shows webhook events
- [ ] User exists in Clerk dashboard

## 📝 Notes

Write any issues or observations here:

```
Date: ___________
Issue: ___________
Solution: ___________
```

## ✨ Completion

Once all items are checked:

- [ ] Authentication working end-to-end
- [ ] Maps still functioning
- [ ] Users can register and login
- [ ] Webhooks syncing data
- [ ] No console errors
- [ ] Ready for development!

---

**Need help?** Check these files:
- `CLERK_SETUP_GUIDE.md` - Detailed instructions
- `INTEGRATION_COMPLETE.md` - Quick start guide
- `CLERK_MIGRATION_SUMMARY.md` - What changed

**Clerk Resources:**
- Dashboard: https://dashboard.clerk.com
- Docs: https://clerk.com/docs
- Support: https://clerk.com/support
