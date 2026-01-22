# 🚀 Complete Deployment Guide - Frontend & Backend

## 📋 What You'll Deploy

1. **Backend REST API** → Vercel
2. **Frontend (React)** → Vercel
3. **Socket.io Server** → Railway (Optional, for real-time features)

**Total Time:** 15-20 minutes  
**Total Cost:** $0 (FREE tiers)

---

## 🎯 PART 1: Deploy Backend to Vercel

### Step 1: Install Vercel CLI

Open PowerShell and run:

```powershell
npm install -g vercel
```

### Step 2: Login to Vercel

```powershell
vercel login
```

This will open your browser. Login with GitHub, GitLab, or email.

### Step 3: Navigate to Backend

```powershell
cd "c:\Users\omprakash\Music\Campus Saftey\backend"
```

### Step 4: Deploy Backend

```powershell
vercel
```

**Follow the prompts:**
- "Set up and deploy?" → **Yes**
- "Which scope?" → Select your account
- "Link to existing project?" → **No**
- "What's your project's name?" → `campus-safety-backend` (or any name)
- "In which directory is your code located?" → `./` (press Enter)

**Wait for deployment...** ⏳

You'll get a URL like: `https://campus-safety-backend.vercel.app`

### Step 5: Add Environment Variables

Go to https://vercel.com/dashboard

1. Click on your `campus-safety-backend` project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://tukeshkumar1703_db_user:mcHuw3PreKvOP7sh@cluster0.inhnu8h.mongodb.net/?appName=Cluster0
CLERK_SECRET_KEY=sk_test_ooCzSmvSQQZQ8ZTI4oFvhOiJObhpx3YXDe3hVszV5L
CLERK_PUBLISHABLE_KEY=pk_test_dmVyaWZpZWQtZXNjYXJnb3QtNzcuY2xlcmsuYWNjb3VudHMuZGV2JA
AWS_ACCESS_KEY_ID=dummy-key
AWS_SECRET_ACCESS_KEY=dummy-secret
AWS_REGION=us-east-1
FRONTEND_URL=http://localhost:5173
```

**Note:** We'll update `FRONTEND_URL` after deploying frontend.

### Step 6: Redeploy with Environment Variables

```powershell
vercel --prod
```

### Step 7: Test Backend

Open your browser or use curl:

```powershell
curl https://campus-safety-backend.vercel.app/health
```

**Expected response:**
```json
{
  "status": "OK",
  "environment": "production",
  "socketio": "disabled"
}
```

✅ **Backend deployed successfully!**

**Save your backend URL:** `https://campus-safety-backend.vercel.app`

---

## 🎨 PART 2: Deploy Frontend to Vercel

### Step 1: Navigate to Frontend

```powershell
cd "c:\Users\omprakash\Music\Campus Saftey\frontend"
```

### Step 2: Update Environment Variables

Create or update `frontend/.env.production`:

```env
VITE_API_URL=https://campus-safety-backend.vercel.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dmVyaWZpZWQtZXNjYXJnb3QtNzcuY2xlcmsuYWNjb3VudHMuZGV2JA
```

**Replace** `https://campus-safety-backend.vercel.app` with your actual backend URL from Part 1.

### Step 3: Build Frontend Locally (Test)

```powershell
npm run build
```

If build succeeds, you're ready to deploy! ✅

### Step 4: Deploy Frontend

```powershell
vercel
```

**Follow the prompts:**
- "Set up and deploy?" → **Yes**
- "Which scope?" → Select your account
- "Link to existing project?" → **No**
- "What's your project's name?" → `campus-safety-frontend` (or any name)
- "In which directory is your code located?" → `./` (press Enter)

**Wait for deployment...** ⏳

You'll get a URL like: `https://campus-safety-frontend.vercel.app`

### Step 5: Deploy to Production

```powershell
vercel --prod
```

### Step 6: Test Frontend

Open your frontend URL in browser:

```
https://campus-safety-frontend.vercel.app
```

You should see your Campus Safety app! 🎉

✅ **Frontend deployed successfully!**

**Save your frontend URL:** `https://campus-safety-frontend.vercel.app`

---

## 🔄 PART 3: Update CORS Settings

### Step 1: Update Backend Environment Variable

Go to https://vercel.com/dashboard

1. Click on `campus-safety-backend` project
2. Go to **Settings** → **Environment Variables**
3. Find `FRONTEND_URL`
4. Update to: `https://campus-safety-frontend.vercel.app` (your actual frontend URL)
5. Click **Save**

### Step 2: Redeploy Backend

```powershell
cd "c:\Users\omprakash\Music\Campus Saftey\backend"
vercel --prod
```

This ensures CORS allows your frontend domain.

---

## ✅ PART 4: Verify Everything Works

### Test 1: Frontend Loads

Open: `https://campus-safety-frontend.vercel.app`

- ✅ Page loads without errors
- ✅ No CORS errors in browser console (F12)

### Test 2: Backend API Works

Open: `https://campus-safety-backend.vercel.app/health`

- ✅ Returns JSON with "status": "OK"

### Test 3: Authentication Works

1. Go to your frontend
2. Try to login
3. Should redirect to Clerk login
4. After login, should see dashboard

### Test 4: API Calls Work

1. Try creating a report (if you have that feature)
2. Check browser console (F12) → Network tab
3. API calls should go to your Vercel backend
4. No CORS errors

---

## 🎉 SUCCESS! Both Deployed!

**Your URLs:**
- **Frontend:** `https://campus-safety-frontend.vercel.app`
- **Backend:** `https://campus-safety-backend.vercel.app`

**What's Working:**
- ✅ Frontend hosted on Vercel
- ✅ Backend API on Vercel
- ✅ Authentication (Clerk)
- ✅ Database (MongoDB Atlas)
- ✅ CORS configured
- ✅ All on FREE tier!

**What's NOT Working (Yet):**
- ❌ Real-time features (Socket.io)

To enable real-time features, continue to **PART 5** below.

---

## 🔌 PART 5: Deploy Socket.io (Optional - For Real-time Features)

**Skip this if you don't need real-time updates.**

### Step 1: Sign up for Railway

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Login with GitHub

### Step 2: Deploy Socket.io Server

1. Click **"Deploy from GitHub repo"**
2. Select your `Campus Safety` repository
3. Railway will detect it's a Node.js project

### Step 3: Configure Railway

1. **Root Directory:** Leave empty (or set to `backend`)
2. **Start Command:** `node socket-server.js`
3. Click **"Deploy"**

### Step 4: Add Environment Variables

In Railway dashboard, click **"Variables"** tab and add:

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://tukeshkumar1703_db_user:mcHuw3PreKvOP7sh@cluster0.inhnu8h.mongodb.net/?appName=Cluster0
FRONTEND_URL=https://campus-safety-frontend.vercel.app
```

**Replace** `FRONTEND_URL` with your actual frontend URL.

### Step 5: Get Railway URL

After deployment, Railway gives you a URL like:
`https://campus-safety-socket.railway.app`

### Step 6: Update Frontend

Update `frontend/.env.production`:

```env
VITE_API_URL=https://campus-safety-backend.vercel.app
VITE_SOCKET_URL=https://campus-safety-socket.railway.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dmVyaWZpZWQtZXNjYXJnb3QtNzcuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### Step 7: Update Frontend Code

Edit `frontend/src/services/socketService.js` (line 23):

```javascript
this.socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
});
```

### Step 8: Redeploy Frontend

```powershell
cd "c:\Users\omprakash\Music\Campus Saftey\frontend"
vercel --prod
```

### Step 9: Test Real-time Features

1. Open your frontend
2. Open browser console (F12)
3. Look for: "✅ Socket.io connected"
4. Real-time updates should now work! 🎉

---

## 📊 Final Architecture

```
┌─────────────────────────────────────────────┐
│         Your Production Setup               │
└─────────────────────────────────────────────┘

Frontend (Vercel)
    ↓
    ├──→ REST API (Vercel)
    │       ↓
    │    MongoDB Atlas
    │
    └──→ Socket.io (Railway)
            ↓
         MongoDB Atlas
```

---

## 🔧 Troubleshooting

### Issue: "Module not found" error

**Solution:**
```powershell
cd backend
npm install
vercel --prod
```

### Issue: "CORS error" in browser

**Solution:**
1. Check `FRONTEND_URL` in backend environment variables
2. Make sure it matches your actual frontend URL
3. Redeploy backend: `vercel --prod`

### Issue: "Cannot connect to database"

**Solution:**
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Add `0.0.0.0/0` (allow all)
4. Redeploy: `vercel --prod`

### Issue: Frontend shows blank page

**Solution:**
1. Check browser console (F12) for errors
2. Verify `VITE_API_URL` in `.env.production`
3. Rebuild: `npm run build`
4. Redeploy: `vercel --prod`

---

## 📝 Quick Commands Reference

```powershell
# Deploy backend
cd "c:\Users\omprakash\Music\Campus Saftey\backend"
vercel --prod

# Deploy frontend
cd "c:\Users\omprakash\Music\Campus Saftey\frontend"
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

---

## ✅ Deployment Checklist

### Backend
- [ ] Vercel CLI installed
- [ ] Logged into Vercel
- [ ] Backend deployed
- [ ] Environment variables added
- [ ] Health endpoint works
- [ ] MongoDB connection successful

### Frontend
- [ ] `.env.production` updated with backend URL
- [ ] Frontend deployed
- [ ] Frontend loads in browser
- [ ] No CORS errors
- [ ] Authentication works
- [ ] API calls work

### Socket.io (Optional)
- [ ] Railway account created
- [ ] Socket server deployed
- [ ] Environment variables added
- [ ] Frontend updated with socket URL
- [ ] Real-time features work

---

## 🎯 Next Steps After Deployment

1. **Test everything thoroughly**
2. **Set up custom domain** (optional)
3. **Enable analytics** in Vercel dashboard
4. **Set up error tracking** (Sentry - optional)
5. **Monitor performance**
6. **Set up automated backups** for MongoDB

---

## 💰 Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Backend) | Hobby | **$0/month** |
| Vercel (Frontend) | Hobby | **$0/month** |
| Railway (Socket.io) | Free Tier | **$0/month*** |
| MongoDB Atlas | Free Tier | **$0/month** |
| Clerk Auth | Free Tier | **$0/month** |
| **TOTAL** | | **$0/month** |

*Railway gives $5 free credit monthly

---

## 🎉 Congratulations!

You've successfully deployed your Campus Safety application!

**What you've accomplished:**
- ✅ Backend API deployed and working
- ✅ Frontend deployed and accessible
- ✅ Database connected
- ✅ Authentication working
- ✅ All on FREE tiers!

**Your live URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app`
- Socket.io: `https://your-socket.railway.app` (if deployed)

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/

---

**Ready to deploy? Start with PART 1 above!** 🚀
