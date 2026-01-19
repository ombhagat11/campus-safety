# Moderator Main Dashboard Stats Fix - Complete

## Issue
Moderators viewing the main dashboard (`/app/dashboard`) were seeing zeros for all stats, even though we had already implemented stats fetching.

## Root Cause
The Dashboard component was trying to use `/admin/analytics` endpoint for ALL moderators and admins, but the backend only allows `["admin", "super-admin"]` roles to access this endpoint - **moderators are excluded**!

```javascript
// backend/src/routes/admin.routes.js
router.use(authenticate, requireRole(["admin", "super-admin"])); // ❌ No moderator!
```

This caused the API call to fail with a 403 Forbidden error, leaving stats at their default zero values.

## Solution
Updated the Dashboard component to use **different endpoints based on user role**:

### For Admins (admin, super-admin)
✅ Use `/admin/analytics` endpoint
- Has access to full analytics
- Gets aggregated campus-wide data

### For Moderators
✅ Use `/moderation/reports` endpoint with different status filters
- Fetch total reports count
- Fetch reported (pending) count
- Fetch verified count
- Fetch resolved count
- Calculate stats from these counts

### For Students
✅ Use `/users/:id/reports` endpoint
- Fetch personal reports
- Calculate personal stats

## Changes Made

### File: `frontend/src/pages/Dashboard.jsx`

**Before**:
```javascript
// Check if user is moderator or admin
const isModerator = ['moderator', 'admin', 'super-admin'].includes(userData.role);

if (isModerator) {
    // ❌ This fails for moderators!
    const analyticsResponse = await apiClient.get('/admin/analytics');
    // ...
}
```

**After**:
```javascript
// Check user role separately
const isModerator = userData.role === 'moderator';
const isAdmin = ['admin', 'super-admin'].includes(userData.role);

if (isAdmin) {
    // ✅ Admins use admin analytics
    const analyticsResponse = await apiClient.get('/admin/analytics');
    // ...
} else if (isModerator) {
    // ✅ Moderators use moderation endpoints
    const allReportsResponse = await apiClient.get('/moderation/reports', {
        params: { limit: 1 }
    });
    const totalReports = allReportsResponse.data.data.pagination?.total || 0;

    const reportedResponse = await apiClient.get('/moderation/reports', {
        params: { status: 'reported', limit: 1 }
    });
    const reportedCount = reportedResponse.data.data.pagination?.total || 0;

    // ... fetch verified and resolved counts

    setStats({
        totalReports,
        activeReports: reportedCount + verifiedCount,
        resolvedReports: resolvedCount,
        nearbyIncidents: reportedCount
    });
} else {
    // ✅ Students use personal reports
    // ...
}
```

## Stats Calculation

### Admins
- **Campus Reports**: From analytics.summary.totalReports
- **Active Incidents**: reported + verified counts
- **Resolved**: From analytics status data
- **Pending Reports**: reported count

### Moderators
- **Campus Reports**: Total count from `/moderation/reports`
- **Active Incidents**: reported + verified counts
- **Resolved**: resolved count
- **Pending Reports**: reported count (needs attention)

### Students
- **My Reports**: Count of user's own reports
- **Active Incidents**: User's reported + verified reports
- **Resolved**: User's resolved reports
- **Nearby Alerts**: Reports within notification radius

## API Endpoints Used

### Moderators
- `GET /moderation/reports?limit=1` - Get total count
- `GET /moderation/reports?status=reported&limit=1` - Get reported count
- `GET /moderation/reports?status=verified&limit=1` - Get verified count
- `GET /moderation/reports?status=resolved&limit=1` - Get resolved count
- `GET /moderation/reports?limit=5` - Get recent reports

### Admins
- `GET /admin/analytics` - Get full analytics
- `GET /reports?limit=5&sortBy=createdAt&sortOrder=desc` - Get recent reports

### Students
- `GET /auth/me` - Get user profile
- `GET /users/:id/reports` - Get user's reports
- `GET /reports/nearby?lat={lat}&lon={lon}&radius={radius}` - Get nearby reports
- `GET /reports?limit=5&sortBy=createdAt&sortOrder=desc` - Get recent reports

## Testing Checklist

### Moderator Main Dashboard
- [x] Login as moderator
- [x] Navigate to `/app/dashboard` (main dashboard)
- [x] Verify "Campus Reports" shows total count (not zero)
- [x] Verify "Active Incidents" shows reported + verified count
- [x] Verify "Resolved" shows resolved count
- [x] Verify "Pending Reports" shows reported count
- [x] No console errors

### Admin Main Dashboard
- [x] Login as admin
- [x] Navigate to `/app/dashboard`
- [x] Verify all stats show from analytics endpoint
- [x] No console errors

### Student Main Dashboard
- [x] Login as student
- [x] Navigate to `/app/dashboard`
- [x] Verify "My Reports" shows personal count
- [x] Verify stats are personal, not campus-wide

## Status
✅ **COMPLETE** - Moderators can now see proper stats on the main dashboard at `/app/dashboard`

## Note
Moderators have TWO dashboards:
1. **Main Dashboard** (`/app/dashboard`) - Shows campus-wide stats using moderation endpoints
2. **Moderator Dashboard** (`/app/moderator/dashboard`) - Specialized moderator interface with queue management
