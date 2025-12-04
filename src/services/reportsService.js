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
        lat: latitude,
        lon: longitude,
        radius,
        ...filters,
    };

    const response = await apiClient.get("/reports/nearby", { params });
    return response.data;
};

/**
 * Get all reports (paginated feed)
 * @param {number} page
 * @param {number} limit
 * @param {object} filters - category, severity, status, sort
 */
export const getAllReports = async (page = 1, limit = 20, filters = {}) => {
    const params = {
        page,
        limit,
        ...filters,
    };

    const response = await apiClient.get("/reports", { params });
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
 * Vote on report (upvote/downvote)
 */
export const voteOnReport = async (reportId, voteType) => {
    const response = await apiClient.post(`/reports/${reportId}/vote`, { voteType });
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
export const addComment = async (reportId, content, isAnonymous = false) => {
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
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    voteOnReport,
    getReportComments,
    addComment,
    reportSpam,
};
