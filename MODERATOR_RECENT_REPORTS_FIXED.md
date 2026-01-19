# Moderator Recent Reports Fix - Complete

## Issue
Moderators viewing the main dashboard were seeing "No reports yet" in the Recent Reports section, even though stats showed there were reports (15 active, 6 resolved).

## Root Cause
The `/moderation/reports` endpoint has a **default status filter** of `"reported"`:

```javascript
// backend/src/controllers/moderation.controller.js
const { status = "reported", ... } = req.query;
```

When fetching recent reports with:
```javascript
await apiClient.get('/moderation/reports', { params: { limit: 5 } });
```

It was only returning reports with `status = "reported"`, not all reports. If there were no reported reports, it would return an empty array.

## Solution
Changed the moderator dashboard to use the general `/reports` endpoint instead of `/moderation/reports` for fetching recent reports:

### Before
```javascript
// ❌ Only gets "reported" status reports
const recentReportsResponse = await apiClient.get('/moderation/reports', {
    params: { limit: 5 }
});
```

### After
```javascript
// ✅ Gets all reports, sorted by newest first
const recentReportsResponse = await apiClient.get('/reports', {
    params: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }
});
```

## Why This Works

### `/moderation/reports` endpoint
- Defaults to `status = "reported"`
- Designed for moderation queue (pending reports)
- Filters by status unless explicitly overridden

### `/reports` endpoint
- No default status filter
- Returns all reports (across all statuses)
- Perfect for "recent reports" view

## Changes Made

### File: `frontend/src/pages/Dashboard.jsx`

Updated the moderator section to fetch recent reports from `/reports` instead of `/moderation/reports`:

```javascript
} else if (isModerator) {
    // ... fetch stats counts ...

    // Fetch recent reports - use general reports endpoint to get all statuses
    const recentReportsResponse = await apiClient.get('/reports', {
        params: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }
    });
    const recentReports = recentReportsResponse.data.data.reports || [];

    setStats({ ... });
    setRecentReports(recentReports); // ✅ Now populated!
}
```

## Recent Reports Now Shows

For **Moderators**:
- ✅ Last 5 reports across **all statuses** (reported, verified, resolved, invalid)
- ✅ Sorted by creation date (newest first)
- ✅ Shows report title, category, status, severity
- ✅ Clickable to view details

## Testing Checklist

- [x] Login as moderator
- [x] Navigate to main dashboard (`/app/dashboard`)
- [x] Verify "Recent Reports" section shows reports
- [x] Verify reports are from all statuses (not just reported)
- [x] Verify reports are sorted by newest first
- [x] Click on a report to view details

## Status
✅ **COMPLETE** - Moderators can now see recent reports on the main dashboard
