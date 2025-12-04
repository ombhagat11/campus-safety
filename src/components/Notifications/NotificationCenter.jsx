import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

// Notification Center Component
const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // TODO: Fetch notifications from API
        // For now, using dummy data
        const dummyNotifications = [];
        setNotifications(dummyNotifications);
        setUnreadCount(dummyNotifications.filter(n => !n.isRead).length);
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    return (
        <>
            <Toaster position="top-right" />

            <div className="relative">
                {/* Bell Icon */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
                >
                    <svg className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-slide-in-bottom">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Notifications</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors duration-200"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium">No notifications yet</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">We'll notify you when something arrives</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200 ${!notification.isRead ? "bg-sky-50 dark:bg-sky-900/20" : ""
                                            }`}
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 flex-shrink-0" style={{ opacity: notification.isRead ? 0 : 1 }}></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{notification.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationCenter;
