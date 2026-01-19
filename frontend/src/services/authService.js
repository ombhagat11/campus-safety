import apiClient from "../services/apiClient";
import useAuthStore from "../stores/authStore";

export const authService = {
    /**
     * Register a new user
     */
    async register(data) {
        const response = await apiClient.post("/auth/register", data);
        return response.data;
    },

    /**
     * Login user
     */
    async login(credentials) {
        const response = await apiClient.post("/auth/login", credentials);
        const { user, accessToken, refreshToken } = response.data.data;

        // Update auth store
        useAuthStore.getState().setAuth({ user, accessToken, refreshToken });

        return response.data;
    },

    /**
     * Logout user
     */
    async logout() {
        useAuthStore.getState().logout();
    },

    /**
     * Request password reset
     */
    async forgotPassword(email) {
        const response = await apiClient.post("/auth/forgot", { email });
        return response.data;
    },

    /**
     * Reset password with token
     */
    async resetPassword(token, password) {
        const response = await apiClient.post("/auth/reset", { token, password });
        return response.data;
    },

    /**
     * Verify email with token
     */
    async verifyEmail(token) {
        const response = await apiClient.post("/auth/verify-email", { token });
        return response.data;
    },

    /**
     * Get current user
     */
    async getMe() {
        const response = await apiClient.get("/auth/me");
        const { user } = response.data.data;

        // Update user in store
        useAuthStore.getState().setUser(user);

        return response.data;
    },

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        const response = await apiClient.post("/auth/refresh", { refreshToken });
        return response.data;
    },
};

export default authService;
