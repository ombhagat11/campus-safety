import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Set authentication data
            setAuth: (data) => {
                const { user, accessToken, refreshToken } = data;

                // Store tokens in localStorage for axios interceptor
                if (accessToken) localStorage.setItem("access_token", accessToken);
                if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    error: null,
                });
            },

            // Update user data
            setUser: (user) => {
                set({ user });
            },

            // Set loading state
            setLoading: (isLoading) => {
                set({ isLoading });
            },

            // Set error
            setError: (error) => {
                set({ error });
            },

            // Clear error
            clearError: () => {
                set({ error: null });
            },

            // Logout
            logout: () => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");

                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            // Check if user has specific role
            hasRole: (roles) => {
                const { user } = get();
                if (!user) return false;

                if (typeof roles === "string") {
                    return user.role === roles;
                }
                return roles.includes(user.role);
            },

            // Check if user is moderator or admin
            canModerate: () => {
                const { user } = get();
                if (!user) return false;
                return ["moderator", "admin", "super-admin"].includes(user.role);
            },

            // Check if user is admin
            canAdmin: () => {
                const { user } = get();
                if (!user) return false;
                return ["admin", "super-admin"].includes(user.role);
            },
        }),
        {
            name: "auth-storage",
            partialPersist: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
