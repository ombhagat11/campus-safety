import { GEO_SETTINGS } from "./constants";
import { formatDistanceToNow, format } from "date-fns";

/**
 * Get current user location using Geolocation API
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: GEO_SETTINGS.HIGH_ACCURACY,
                timeout: GEO_SETTINGS.TIMEOUT,
                maximumAge: GEO_SETTINGS.MAX_AGE,
            }
        );
    });
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @returns distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Format distance for display
 */
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format absolute date
 */
export const formatDate = (date, formatStr = "MMM d, yyyy 'at' h:mm a") => {
    return format(new Date(date), formatStr);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error("Failed to copy:", err);
        return false;
    }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

export default {
    getCurrentLocation,
    calculateDistance,
    formatDistance,
    formatRelativeTime,
    formatDate,
    isValidEmail,
    truncate,
    debounce,
    copyToClipboard,
    formatFileSize,
};
