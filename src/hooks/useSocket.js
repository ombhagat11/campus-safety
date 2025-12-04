import { useEffect, useRef } from "react";
import socketService from "../services/socketService";
import useAuthStore from "../stores/authStore";

/**
 * Custom hook for Socket.io connection
 * Automatically connects when user is authenticated
 */
export const useSocket = () => {
    const { user, accessToken } = useAuthStore();
    const hasConnected = useRef(false);

    useEffect(() => {
        if (accessToken && user && !hasConnected.current) {
            socketService.connect();
            hasConnected.current = true;
        }

        return () => {
            if (hasConnected.current) {
                socketService.disconnect();
                hasConnected.current = false;
            }
        };
    }, [accessToken, user]);

    return {
        socket: socketService,
        connected: socketService.isConnected(),
    };
};

/**
 * Hook to subscribe to Socket.io events
 * @param {string} event - Event name
 * @param {function} callback - Event handler
 */
export const useSocketEvent = (event, callback) => {
    useEffect(() => {
        const unsubscribe = socketService.on(event, callback);
        return unsubscribe;
    }, [event, callback]);
};

/**
 * Hook for real-time report updates
 */
export const useRealtimeReports = (onNewReport, onReportUpdate) => {
    useSocketEvent("new_report", onNewReport);
    useSocketEvent("report_update", onReportUpdate);
};

/**
 * Hook for real-time comments on a specific report
 */
export const useRealtimeComments = (reportId, onNewComment) => {
    useEffect(() => {
        if (reportId) {
            socketService.joinReport(reportId);
            const unsubscribe = socketService.on("new_comment", (data) => {
                if (data.reportId === reportId) {
                    onNewComment(data);
                }
            });

            return () => {
                socketService.leaveReport(reportId);
                unsubscribe();
            };
        }
    }, [reportId, onNewComment]);
};

export default useSocket;
