# Report Queue & Dashboard Status Fix - Complete

## Issues Fixed

### 1. **Moderators and Admins Not Seeing Reports in Report Queue**
**Problem**: The Report Queue page was showing "No reports found" for all moderators and admins.

**Root Causes**:
1. Using raw `axios` instead of `apiClient` - missing base URL and authentication headers
2. Status mismatch - Frontend using `"pending"` but backend schema uses `"reported"`

### 2. **Dashboard Stats Using Wrong Status**
**Problem**: Dashboard stats were calculating active reports using the non-existent `"pending"` status.

## Backend Status Values (Correct)
According to `backend/src/db/schemas/Report.js`, the valid status values are:
```javascript
enum: ["reported", "verified", "investigating", "resolved", "invalid", "spam"]
```

The default status when a report is created is `"reported"`.

## Changes Made

### File: `frontend/src/pages/moderator/ReportQueue.jsx`

**Changes**:
1. ✅ Replaced `axios` with `apiClient` for proper API calls
2. ✅ Changed default filter from `"pending"` to `"reported"`
3. ✅ Updated filter tabs: "Pending" → "Reported"
4. ✅ Updated action button condition from `filter === "pending"` to `filter === "reported"`

**Before**:
```javascript
import axios from "axios";
const [filter, setFilter] = useState("pending");
const response = await axios.get("/moderation/reports", {...});
{ label: "Pending", value: "pending", ... }
{filter === "pending" && (...)}
```

**After**:
```javascript
import apiClient from "../../services/apiClient";
const [filter, setFilter] = useState("reported");
const response = await apiClient.get("/moderation/reports", {...});
{ label: "Reported", value: "reported", ... }
{filter === "reported" && (...)}
```

### File: `frontend/src/pages/Dashboard.jsx`

**Changes**:
1. ✅ Fixed admin/moderator stats calculation to use `"reported"` instead of `"pending"`
2. ✅ Fixed student stats calculation to use `"reported"` instead of `"pending"`

**Admin/Moderator Stats - Before**:
```javascript
const activeReports = (statusData.pending || 0) + (statusData.verified || 0);
const nearbyIncidents = statusData.pending || 0;
```

**Admin/Moderator Stats - After**:
```javascript
const activeReports = (statusData.reported || 0) + (statusData.verified || 0);
const nearbyIncidents = statusData.reported || 0;
```

**Student Stats - Before**:
```javascript
const activeReports = userReports.filter(
    report => report.status === 'pending' || report.status === 'verified'
).length;
```

**Student Stats - After**:
```javascript
const activeReports = userReports.filter(
    report => report.status === 'reported' || report.status === 'verified'
).length;
```

## API Endpoints Used

### Report Queue (Moderators/Admins)
- `GET /moderation/reports?status={status}` - Get reports for moderation
- `PATCH /moderation/reports/:id` - Update report status

### Dashboard
- `GET /auth/me` - Get current user
- `GET /admin/analytics` - Get campus analytics (moderators/admins)
- `GET /users/{id}/reports` - Get user's reports (students)
- `GET /reports/nearby` - Get nearby reports (students)

## Status Flow

1. **User creates report** → Status: `"reported"`
2. **Moderator verifies** → Status: `"verified"`
3. **Moderator/Admin resolves** → Status: `"resolved"`
4. **Moderator marks invalid** → Status: `"invalid"`

## Testing Checklist

### Report Queue
- [x] Login as moderator or admin
- [x] Navigate to Report Queue
- [x] Verify "Reported" tab shows newly created reports
- [x] Verify action buttons (Verify, Mark Invalid) appear for reported reports
- [x] Test verifying a report → should move to "Verified" tab
- [x] Test marking as invalid → should move to "Invalid" tab
- [x] Test resolving a verified report → should move to "Resolved" tab

### Dashboard Stats
- [x] Login as student → verify stats show personal reports
- [x] Login as moderator/admin → verify stats show campus-wide data
- [x] Verify "Active Incidents" counts reported + verified reports
- [x] Verify "Resolved" counts resolved reports

## Status
✅ **COMPLETE** - Report Queue and Dashboard now working correctly for all user roles with proper status values
