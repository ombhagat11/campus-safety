import apiClient from "./apiClient";

/**
 * Get nearby reports (geospatial query)
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radius - in meters (default 500)
 * @param {object} filters - category, severity, status
 */
export const getNearbyReports = async (latitude, longitude, radius = 500, filters = {}) => {
    const params = {
        latitude,
        longitude,
        radius,
        ...filters,
    };

    const response = await apiClient.get("/reports/nearby", { params });
    return response.data;
};

/**
 * Get report by ID
 */
export const getReportById = async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
};

/**
 * Create new report
 */
export const createReport = async (reportData) => {
    const response = await apiClient.post("/reports", reportData);
    return response.data;
};

/**
 * Update report
 */
export const updateReport = async (reportId, updates) => {
    const response = await apiClient.patch(`/reports/${reportId}`, updates);
    return response.data;
};

/**
 * Delete report
 */
export const deleteReport = async (reportId) => {
    const response = await apiClient.delete(`/reports/${reportId}`);
    return response.data;
};

/**
 * Vote on report (confirm/dispute)
 */
export const voteOnReport = async (reportId, vote) => {
    const response = await apiClient.post(`/reports/${reportId}/vote`, { vote });
    return response.data;
};

/**
 * Get comments for a report
 */
export const getReportComments = async (reportId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/reports/${reportId}/comments`, {
        params: { page, limit },
    });
    return response.data;
};

/**
 * Add comment to report
 */
export const addComment = async (reportId, commentData) => {
    const { content, isAnonymous = false } = commentData;
    const response = await apiClient.post(`/reports/${reportId}/comment`, {
        content,
        isAnonymous,
    });
    return response.data;
};

/**
 * Report spam
 */
export const reportSpam = async (reportId, reason) => {
    const response = await apiClient.post(`/reports/${reportId}/report-spam`, { reason });
    return response.data;
};

export default {
    getNearbyReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    voteOnReport,
    getReportComments,
    addComment,
    reportSpam,
};
