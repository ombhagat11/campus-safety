import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "../services/apiClient";

const useNotificationStore = create(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            loading: false,

            // Fetch notifications from API
            fetchNotifications: async () => {
                try {
                    set({ loading: true });
                    const response = await apiClient.get("/users/me/notifications");
                    const notifs = response.data.notifications;
                    set({
                        notifications: notifs,
                        unreadCount: notifs.filter((n) => !n.read).length,
                        loading: false,
                    });
                } catch (error) {
                    console.error("Failed to fetch notifications:", error);
                    set({ loading: false });
                }
            },

            // Add new notification (from socket)
            addNotification: (notification) => {
                set((state) => ({
                    notifications: [notification, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }));
            },

            // Mark single notification as read
            markAsRead: async (notificationId) => {
                try {
                    // Optimistic update
                    set((state) => {
                        const notifs = state.notifications.map((n) =>
                            n._id === notificationId ? { ...n, read: true } : n
                        );
                        return {
                            notifications: notifs,
                            unreadCount: notifs.filter((n) => !n.read).length,
                        };
                    });

                    await apiClient.patch(`/users/me/notifications/${notificationId}/read`);
                } catch (error) {
                    console.error("Failed to mark notification as read:", error);
                }
            },

            // Mark all as read
            markAllAsRead: async () => {
                try {
                    // Optimistic update
                    set((state) => ({
                        notifications: state.notifications.map((n) => ({ ...n, read: true })),
                        unreadCount: 0,
                    }));

                    await apiClient.post("/users/me/notifications/read-all");
                } catch (error) {
                    console.error("Failed to mark all as read:", error);
                }
            },

            // Clear all notifications
            clearAll: () => {
                set({ notifications: [], unreadCount: 0 });
            },
        }),
        {
            name: "notification-storage",
            partialize: (state) => ({ notifications: state.notifications, unreadCount: state.unreadCount }),
        }
    )
);

export default useNotificationStore;
