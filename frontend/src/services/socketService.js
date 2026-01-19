import { io } from "socket.io-client";
import useAuthStore from "../stores/authStore";

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        const token = useAuthStore.getState().accessToken;

        if (!token) {
            console.warn("Cannot connect to Socket.io: No auth token");
            return null;
        }

        this.socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        this.setupEventHandlers();
        return this.socket;
    }

    setupEventHandlers() {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            console.log("✅ Socket.io connected");
            this.connected = true;
        });

        this.socket.on("disconnect", (reason) => {
            console.log("❌ Socket.io disconnected:", reason);
            this.connected = false;
        });

        this.socket.on("connect_error", (error) => {
            console.error("Socket.io connection error:", error);
        });

        this.socket.on("reconnect", (attemptNumber) => {
            console.log(`🔄 Socket.io reconnected after ${attemptNumber} attempts`);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.listeners.clear();
        }
    }

    // Subscribe to events
    on(event, callback) {
        if (!this.socket) {
            console.warn(`Cannot subscribe to ${event}: Socket not connected`);
            return () => { };
        }

        this.socket.on(event, callback);

        // Track listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }

        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Emit events
    emit(event, data) {
        if (!this.socket?.connected) {
            console.warn(`Cannot emit ${event}: Socket not connected`);
            return false;
        }

        this.socket.emit(event, data);
        return true;
    }

    // Update location for proximity notifications
    updateLocation(latitude, longitude) {
        this.emit("update_location", { latitude, longitude });
    }

    // Join a specific report room
    joinReport(reportId) {
        this.emit("join_report", reportId);
    }

    // Leave a specific report room
    leaveReport(reportId) {
        this.emit("leave_report", reportId);
    }

    isConnected() {
        return this.connected && this.socket?.connected;
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
