# 🔌 Socket.io Solutions for Vercel Deployment

## 🚨 The Problem

**Vercel doesn't support Socket.io** because:
- Vercel uses serverless functions (stateless)
- Socket.io requires persistent WebSocket connections
- Serverless functions spin up/down dynamically

## ✅ 3 Solutions (Best to Simplest)

---

## 🥇 **SOLUTION 1: Deploy Socket.io Separately on Railway** (RECOMMENDED)

### Why Railway?
- ✅ **FREE tier** with 500 hours/month
- ✅ Supports WebSockets natively
- ✅ Easy deployment from GitHub
- ✅ Auto-deploys on push
- ✅ Built-in SSL/HTTPS

### Step-by-Step Setup

#### 1. Create Separate Socket.io Server

Create a new file in your backend: `socket-server.js`

```javascript
import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from './src/utils/jwt.js';
import User from './src/db/schemas/User.js';
import connectDB from './src/db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

// Create HTTP server
const httpServer = createServer();

// Create Socket.io server
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    },
});

// Authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            return next(new Error("User not found or inactive"));
        }

        socket.userId = user._id;
        socket.campusId = user.campusId;
        socket.role = user.role;

        next();
    } catch (error) {
        next(new Error("Authentication failed"));
    }
});

// Connection handler
io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join campus room
    const campusRoom = `campus:${socket.campusId}`;
    socket.join(campusRoom);

    // Join role-specific room
    if (["moderator", "admin", "super-admin"].includes(socket.role)) {
        socket.join(`${socket.role}:${socket.campusId}`);
    }

    // Handle location updates
    socket.on("update_location", (data) => {
        socket.location = data;
        console.log(`📍 Location updated for ${socket.userId}`);
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
        socket.to(`report:${data.reportId}`).emit("user_typing", {
            userId: socket.userId,
            reportId: data.reportId,
        });
    });

    // Join report room
    socket.on("join_report", (reportId) => {
        socket.join(`report:${reportId}`);
        console.log(`User ${socket.userId} joined report: ${reportId}`);
    });

    // Leave report room
    socket.on("leave_report", (reportId) => {
        socket.leave(`report:${reportId}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.userId}`);
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`🔌 Socket.io server running on port ${PORT}`);
});

// Export io for use in other parts of the app
export { io };
```

#### 2. Create `package.json` for Socket Server

Create `socket-package.json`:

```json
{
  "name": "campus-safety-socket-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node socket-server.js"
  },
  "dependencies": {
    "socket.io": "^4.8.1",
    "mongoose": "^9.0.0",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^17.2.3"
  }
}
```

#### 3. Deploy to Railway

1. **Go to Railway.app:**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Campus Safety repository

3. **Configure:**
   - **Root Directory:** `backend` (or wherever socket-server.js is)
   - **Start Command:** `node socket-server.js`

4. **Add Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy:**
   - Railway will auto-deploy
   - You'll get a URL like: `https://your-app.railway.app`

#### 4. Update Frontend to Use Railway Socket Server

Update `frontend/.env`:

```env
VITE_API_URL=https://your-backend.vercel.app
VITE_SOCKET_URL=https://your-socket-server.railway.app
```

Update `frontend/src/services/socketService.js`:

```javascript
// Line 23, change:
this.socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
    // ... rest of config
});
```

#### 5. Update Backend API to Emit to Railway Socket

Since your REST API is on Vercel and Socket.io is on Railway, you need to communicate between them.

**Option A: Use HTTP Webhooks**

In your Vercel backend, when a new report is created:

```javascript
// In your report controller
import axios from 'axios';

export const createReport = async (req, res) => {
    // ... create report logic
    
    // Notify Socket.io server
    try {
        await axios.post(`${process.env.SOCKET_SERVER_URL}/emit`, {
            event: 'new_report',
            room: `campus:${report.campusId}`,
            data: report
        });
    } catch (error) {
        console.error('Failed to notify socket server:', error);
    }
    
    res.json({ success: true, data: report });
};
```

**Option B: Use Redis Pub/Sub** (Better for production)

Install Upstash Redis (free tier):
- Both Vercel and Railway connect to same Redis
- Vercel publishes events
- Railway subscribes and emits to Socket.io

---

## 🥈 **SOLUTION 2: Use Pusher (Managed Service)** (EASIEST)

### Why Pusher?
- ✅ **FREE tier** (100 connections, 200K messages/day)
- ✅ No server management
- ✅ Works perfectly with Vercel
- ✅ Drop-in replacement for Socket.io

### Setup

#### 1. Sign up for Pusher
- Go to https://pusher.com
- Create free account
- Create new app
- Get credentials

#### 2. Install Pusher Client

```bash
cd frontend
npm install pusher-js
```

#### 3. Create Pusher Service

Create `frontend/src/services/pusherService.js`:

```javascript
import Pusher from 'pusher-js';

class PusherService {
    constructor() {
        this.pusher = null;
        this.channels = new Map();
    }

    connect(userId) {
        if (this.pusher) return;

        this.pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
            encrypted: true,
        });

        console.log('✅ Pusher connected');
    }

    subscribe(channelName, eventName, callback) {
        if (!this.pusher) {
            console.warn('Pusher not connected');
            return () => {};
        }

        let channel = this.channels.get(channelName);
        
        if (!channel) {
            channel = this.pusher.subscribe(channelName);
            this.channels.set(channelName, channel);
        }

        channel.bind(eventName, callback);

        // Return unsubscribe function
        return () => {
            channel.unbind(eventName, callback);
        };
    }

    disconnect() {
        if (this.pusher) {
            this.pusher.disconnect();
            this.pusher = null;
            this.channels.clear();
        }
    }
}

const pusherService = new PusherService();
export default pusherService;
```

#### 4. Update Your Hooks

Replace Socket.io hooks with Pusher:

```javascript
// frontend/src/hooks/usePusher.js
import { useEffect } from 'react';
import pusherService from '../services/pusherService';
import useAuthStore from '../stores/authStore';

export const usePusher = () => {
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            pusherService.connect(user.id);
        }
        return () => pusherService.disconnect();
    }, [user]);

    return pusherService;
};

export const usePusherEvent = (channel, event, callback) => {
    useEffect(() => {
        const unsubscribe = pusherService.subscribe(channel, event, callback);
        return unsubscribe;
    }, [channel, event, callback]);
};
```

#### 5. Backend: Trigger Pusher Events

Install Pusher server SDK in backend:

```bash
cd backend
npm install pusher
```

Update your backend to trigger Pusher:

```javascript
// backend/src/services/pusherService.js
import Pusher from 'pusher';

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
});

export const emitNewReport = (campusId, report) => {
    pusher.trigger(`campus-${campusId}`, 'new-report', {
        report
    });
};

export default pusher;
```

---

## 🥉 **SOLUTION 3: Polling (Quick Fix)** (SIMPLEST)

### Why Polling?
- ✅ Works immediately with Vercel
- ✅ No additional services needed
- ✅ Simple to implement
- ⚠️ Less efficient (more API calls)
- ⚠️ Not truly real-time (5-10 second delay)

### Setup

#### 1. Create Polling Hook

```javascript
// frontend/src/hooks/usePolling.js
import { useEffect, useRef } from 'react';

export const usePolling = (callback, interval = 5000) => {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const tick = () => {
            savedCallback.current();
        };

        const id = setInterval(tick, interval);
        return () => clearInterval(id);
    }, [interval]);
};
```

#### 2. Use in Components

```javascript
// Example: Poll for new reports
import { usePolling } from '../hooks/usePolling';
import { useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [reports, setReports] = useState([]);
    const [lastFetch, setLastFetch] = useState(Date.now());

    const fetchNewReports = async () => {
        try {
            const response = await api.get(`/reports?since=${lastFetch}`);
            if (response.data.reports.length > 0) {
                setReports(prev => [...response.data.reports, ...prev]);
                setLastFetch(Date.now());
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        }
    };

    // Poll every 5 seconds
    usePolling(fetchNewReports, 5000);

    return (
        // ... your component
    );
};
```

---

## 📊 **COMPARISON**

| Solution | Cost | Complexity | Real-time | Scalability |
|----------|------|------------|-----------|-------------|
| **Railway** | FREE | Medium | ✅ Yes | ✅ Good |
| **Pusher** | FREE | Low | ✅ Yes | ✅ Excellent |
| **Polling** | FREE | Very Low | ⚠️ No (5-10s delay) | ⚠️ Poor |

---

## 🎯 **RECOMMENDATION**

### For Your Project:

**Use Railway (Solution 1)** because:
1. ✅ You already have Socket.io code
2. ✅ FREE tier is generous
3. ✅ Easy to deploy
4. ✅ Keeps your existing architecture
5. ✅ True real-time performance

**Quick Start:**
1. Create `socket-server.js` (copy from above)
2. Deploy to Railway
3. Update frontend `VITE_SOCKET_URL`
4. Done! ✅

---

## 🚀 **NEXT STEPS**

1. **Choose a solution** (I recommend Railway)
2. **Follow the setup guide** above
3. **Test locally first** before deploying
4. **Update environment variables**
5. **Deploy and test**

---

## 💡 **HYBRID APPROACH** (Best of Both Worlds)

You can use:
- **Vercel** for REST API (fast, scalable)
- **Railway** for Socket.io (real-time)
- **Frontend** connects to both

This gives you:
- ✅ Fast API responses (Vercel CDN)
- ✅ Real-time updates (Railway WebSockets)
- ✅ All on FREE tiers
- ✅ Best performance

---

Need help implementing any of these? Let me know which solution you want to use!
