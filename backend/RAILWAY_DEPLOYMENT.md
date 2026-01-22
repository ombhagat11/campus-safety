# 🚂 Railway Deployment Guide for Socket.io Server

## ⚡ Quick Setup (5 Minutes)

### Step 1: Prepare Your Code

✅ **Already Done!** I've created `socket-server.js` for you.

### Step 2: Deploy to Railway

#### Option A: Railway Dashboard (Easiest)

1. **Go to Railway:**
   - Visit https://railway.app
   - Click "Start a New Project"
   - Login with GitHub

2. **Deploy from GitHub:**
   - Click "Deploy from GitHub repo"
   - Select your `Campus Safety` repository
   - Railway will detect it's a Node.js project

3. **Configure Build:**
   - **Root Directory:** Leave empty (or set to `backend` if needed)
   - **Start Command:** `node socket-server.js`
   - **Build Command:** Leave empty

4. **Add Environment Variables:**
   Click "Variables" tab and add:
   ```env
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=mongodb+srv://tukeshkumar1703_db_user:mcHuw3PreKvOP7sh@cluster0.inhnu8h.mongodb.net/?appName=Cluster0
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Railway will give you a URL like: `https://campus-safety-socket.railway.app`

#### Option B: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd "c:\Users\omprakash\Music\Campus Saftey\backend"
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set FRONTEND_URL=your_frontend_url

# Deploy
railway up
```

### Step 3: Update Frontend

Update `frontend/.env`:

```env
VITE_API_URL=https://your-backend.vercel.app
VITE_SOCKET_URL=https://your-socket-server.railway.app
```

Update `frontend/src/services/socketService.js` line 23:

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

### Step 4: Test

```bash
# Test health endpoint
curl https://your-socket-server.railway.app/health

# Expected response:
{
  "status": "OK",
  "service": "Socket.io Server",
  "timestamp": "2026-01-22T...",
  "uptime": 123.45
}
```

---

## 🔗 Connecting Vercel Backend to Railway Socket.io

Since your REST API is on Vercel and Socket.io is on Railway, you need to trigger events from Vercel.

### Method 1: HTTP Webhook (Simple)

In your Vercel backend, when creating a report:

```javascript
// backend/src/controllers/reports.controller.js
import axios from 'axios';

export const createReport = async (req, res) => {
    try {
        // Create report in database
        const report = await Report.create(req.body);

        // Notify Socket.io server on Railway
        try {
            await axios.post(`${process.env.SOCKET_SERVER_URL}/emit`, {
                event: 'new_report',
                room: `campus:${report.campusId}`,
                data: {
                    type: 'new_report',
                    data: report,
                    timestamp: new Date()
                }
            }, {
                timeout: 3000 // Don't wait too long
            });
        } catch (socketError) {
            // Log but don't fail the request
            console.error('Failed to notify socket server:', socketError.message);
        }

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

Add to Vercel environment variables:
```env
SOCKET_SERVER_URL=https://your-socket-server.railway.app
```

### Method 2: Shared Database (Automatic)

Both servers connect to the same MongoDB. Use MongoDB Change Streams:

```javascript
// In socket-server.js, add:
import Report from './src/db/schemas/Report.js';

// Watch for new reports
const reportChangeStream = Report.watch();

reportChangeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
        const report = change.fullDocument;
        emitNewReport(report.campusId, report);
    }
    
    if (change.operationType === 'update') {
        const reportId = change.documentKey._id;
        const updates = change.updateDescription.updatedFields;
        emitReportUpdate(updates.campusId, reportId, updates);
    }
});
```

---

## 📊 Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│  REST API       │ │  Socket.io      │
│  (Vercel)       │ │  (Railway)      │
└────────┬────────┘ └────────┬────────┘
         │                   │
         └─────────┬─────────┘
                   ▼
         ┌─────────────────┐
         │    MongoDB      │
         │    (Atlas)      │
         └─────────────────┘
```

**Flow:**
1. Frontend makes REST API calls to Vercel
2. Frontend connects WebSocket to Railway
3. Vercel creates/updates data in MongoDB
4. Railway watches MongoDB changes (or receives HTTP webhook)
5. Railway emits Socket.io events to connected clients

---

## ✅ Verification Checklist

After deployment:

- [ ] Railway deployment successful
- [ ] Health endpoint responds: `https://your-socket.railway.app/health`
- [ ] Frontend can connect to Socket.io
- [ ] Real-time events are received
- [ ] No CORS errors in browser console
- [ ] MongoDB connection stable

---

## 💰 Railway Free Tier Limits

- ✅ **500 hours/month** of execution time
- ✅ **100 GB** bandwidth
- ✅ **512 MB** RAM
- ✅ **1 GB** disk space

**For your app:** This is MORE than enough! Even with 24/7 uptime, you'll use ~720 hours/month, but Railway gives you $5 free credit monthly which covers it.

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to Socket.io"

**Check:**
1. Railway deployment logs for errors
2. CORS settings in socket-server.js
3. Frontend VITE_SOCKET_URL is correct
4. MongoDB connection is working

### Issue: "Events not being emitted"

**Check:**
1. Vercel backend is calling the webhook
2. SOCKET_SERVER_URL is set in Vercel
3. Railway server logs show the emit request
4. Frontend is subscribed to the correct events

### Issue: "Connection keeps dropping"

**Check:**
1. Railway service is running (check dashboard)
2. MongoDB connection is stable
3. Frontend reconnection logic is working
4. No firewall blocking WebSocket connections

---

## 🚀 Next Steps

1. **Deploy to Railway** (follow Step 2 above)
2. **Get your Railway URL**
3. **Update frontend** with VITE_SOCKET_URL
4. **Test locally** first
5. **Deploy frontend** to Vercel
6. **Test end-to-end**

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Socket.io Docs:** https://socket.io/docs/v4/

---

**Ready to deploy?** Follow Step 2 above and you'll have Socket.io running in 5 minutes! 🚀
