# 🚨 IMMEDIATE FIX - Get Your Clerk Key

## The Error
```
Missing Clerk Publishable Key
```

## The Fix (5 minutes)

### Step 1: Get Your Clerk Key

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Sign up if you haven't already (it's free!)

2. **Create an Application**
   - Click "Add application"
   - Name: "Campus Safety"
   - Select: Email authentication
   - Click "Create"

3. **Copy Your Publishable Key**
   - You'll see a screen with your API keys
   - Look for "Publishable Key"
   - It starts with `pk_test_`
   - Click to copy it

### Step 2: Update Your .env File

1. **Open the file:**
   ```
   frontend/.env
   ```


2. **Replace the placeholder:**
   ```bash
   # Change this line:
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   
   # To your actual key:
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_abc123xyz...
   ```

3. **Save the file**

### Step 3: Restart Frontend

The frontend dev server should auto-reload, but if not:

```bash
# Stop the frontend (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### Step 4: Verify It Works

1. Open http://localhost:5173
2. The error should be gone!
3. You should see the landing page

## What You'll See

After fixing, you'll be able to:
- ✅ View the landing page
- ✅ Click "Register" (will show Clerk sign-up)
- ✅ Click "Login" (will show Clerk sign-in)

## Next Steps (After This Works)

Once the error is fixed, you'll need to:

1. **Set up webhooks** (for user sync)
   - See: `CLERK_SETUP_GUIDE.md`
   
2. **Add backend keys** (for API authentication)
   - Edit `backend/.env`
   - Add `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET`

3. **Test registration**
   - Register with a campus code
   - Verify user created in MongoDB

## Screenshot Guide

### Where to Find Your Key

```
Clerk Dashboard
├── Select your application
├── Click "API Keys" in sidebar
└── Copy "Publishable Key" (starts with pk_test_)
```

## Troubleshooting

### Still Getting Error After Update?

1. **Check the file was saved**
   ```bash
   cat frontend/.env
   # Should show your actual key
   ```

2. **Restart the dev server**
   ```bash
   cd frontend
   # Stop with Ctrl+C
   npm run dev
   ```

3. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux)
   - Or: Cmd+Shift+R (Mac)

### Key Doesn't Start with pk_test_?

- Make sure you copied the **Publishable Key**, not the Secret Key
- Secret Key starts with `sk_test_` (that goes in backend/.env)
- Publishable Key starts with `pk_test_` (that goes in frontend/.env)

## Quick Reference

### Frontend .env (What You Need Now)
```bash
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

### Backend .env (Needed Later)
```bash
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
MONGODB_URI=your_mongodb_connection_string
```

## Visual Guide

```
┌─────────────────────────────────────────┐
│     Clerk Dashboard                     │
├─────────────────────────────────────────┤
│                                         │
│  API Keys                               │
│                                         │
│  Publishable Key                        │
│  ┌───────────────────────────────────┐ │
│  │ pk_test_abc123...          [Copy] │ │ ← Copy this!
│  └───────────────────────────────────┘ │
│                                         │
│  Secret Key                             │
│  ┌───────────────────────────────────┐ │
│  │ sk_test_xyz789...          [Copy] │ │ ← For backend
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## After You Fix This

Once the frontend loads without errors, follow the complete setup:
- **Full Guide:** `CLERK_SETUP_GUIDE.md`
- **Quick Start:** `INTEGRATION_COMPLETE.md`
- **Checklist:** `SETUP_CHECKLIST.md`

---

**Estimated Time:** 5 minutes
**Difficulty:** Easy
**Cost:** Free (Clerk has a generous free tier)

🎯 **Goal:** Get past the "Missing Clerk Publishable Key" error and see your app!
