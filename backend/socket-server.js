import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected (Socket Server)'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Create HTTP server
const httpServer = createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'OK',
            service: 'Socket.io Server',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }));
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

// Create Socket.io server
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Simple authentication (you can enhance this with JWT verification)
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            console.warn('⚠️  Connection attempt without token');
            return next(new Error('Authentication required'));
        }

        // For now, just accept the connection
        // In production, verify JWT token here
        socket.userId = socket.handshake.auth.userId || 'anonymous';
        socket.campusId = socket.handshake.auth.campusId || 'default';
        socket.role = socket.handshake.auth.role || 'user';

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        next(new Error('Authentication failed'));
    }
});

// Connection handler
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (Campus: ${socket.campusId})`);

    // Join campus room
    const campusRoom = `campus:${socket.campusId}`;
    socket.join(campusRoom);
    console.log(`📍 User ${socket.userId} joined room: ${campusRoom}`);

    // Join role-specific room (for moderators/admins)
    if (['moderator', 'admin', 'super-admin'].includes(socket.role)) {
        const roleRoom = `${socket.role}:${socket.campusId}`;
        socket.join(roleRoom);
        console.log(`👮 User ${socket.userId} joined role room: ${roleRoom}`);
    }

    // Handle location updates (for nearby reports)
    socket.on('update_location', (data) => {
        const { latitude, longitude } = data;
        socket.location = { latitude, longitude };
        console.log(`📍 Location updated for ${socket.userId}: ${latitude}, ${longitude}`);
    });

    // Handle typing indicators (for comments)
    socket.on('typing', (data) => {
        const { reportId } = data;
        socket.to(`report:${reportId}`).emit('user_typing', {
            userId: socket.userId,
            reportId,
        });
    });

    // Handle joining specific report room
    socket.on('join_report', (reportId) => {
        socket.join(`report:${reportId}`);
        console.log(`📄 User ${socket.userId} joined report room: ${reportId}`);
    });

    // Handle leaving report room
    socket.on('leave_report', (reportId) => {
        socket.leave(`report:${reportId}`);
        console.log(`📄 User ${socket.userId} left report room: ${reportId}`);
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
        console.log(`❌ User disconnected: ${socket.userId} (Reason: ${reason})`);
    });

    // Error handler
    socket.on('error', (error) => {
        console.error(`❌ Socket error for user ${socket.userId}:`, error);
    });
});

// Helper functions to emit events (can be called via HTTP API)
export const emitNewReport = (campusId, report) => {
    io.to(`campus:${campusId}`).emit('new_report', {
        type: 'new_report',
        data: report,
        timestamp: new Date(),
    });
    console.log(`📢 Emitted new report to campus:${campusId}`);
};

export const emitReportUpdate = (campusId, reportId, updates) => {
    io.to(`campus:${campusId}`).emit('report_update', {
        type: 'report_update',
        reportId,
        data: updates,
        timestamp: new Date(),
    });

    io.to(`report:${reportId}`).emit('report_update', {
        type: 'report_update',
        reportId,
        data: updates,
        timestamp: new Date(),
    });

    console.log(`📢 Emitted report update: ${reportId}`);
};

export const emitNewComment = (reportId, comment) => {
    io.to(`report:${reportId}`).emit('new_comment', {
        type: 'new_comment',
        reportId,
        data: comment,
        timestamp: new Date(),
    });
    console.log(`📢 Emitted new comment to report:${reportId}`);
};

export const emitSystemAlert = (campusId, alert) => {
    io.to(`campus:${campusId}`).emit('system_alert', {
        type: 'system_alert',
        data: alert,
        timestamp: new Date(),
    });
    console.log(`🚨 Emitted system alert to campus:${campusId}`);
};

// HTTP endpoint to trigger events (for Vercel backend to call)
httpServer.on('request', (req, res) => {
    if (req.method === 'POST' && req.url === '/emit') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { event, room, data } = JSON.parse(body);

                if (room) {
                    io.to(room).emit(event, data);
                } else {
                    io.emit(event, data);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Event emitted' }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
    }
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`🔌 Socket.io server running on port ${PORT}`);
    console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

export { io };
