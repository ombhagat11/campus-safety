import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useNotificationStore from "../../stores/notificationStore";
import { useSocket } from "../../hooks/useSocket";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import NotificationCenter from "../Notifications/NotificationCenter";

const Layout = () => {
    const { addNotification } = useNotificationStore();
    const { socket } = useSocket();

    // Global socket listeners
    useEffect(() => {
        if (socket) {
            // Listen for new notifications
            const unsubscribe = socket.on("new_notification", (notification) => {
                addNotification(notification);
                // Could also show a toast here
            });

            return () => {
                unsubscribe();
            };
        }
    }, [socket, addNotification]);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile Header (Optional, for notifications/profile if needed) */}
                <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
                    <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                        CampusSafe
                    </span>
                    <NotificationCenter />
                </header>

                {/* Desktop Header (for Notifications/Search if needed) */}
                <header className="hidden md:flex sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-8 h-16 items-center justify-end gap-4">
                    <NotificationCenter />
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default Layout;
