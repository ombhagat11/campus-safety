# Report Queue Tab Counts Fix - Complete

## Issue
When marking reports as verified, invalid, or resolved in the Report Queue, the reports would disappear from the current tab but the tab badges (counts) wouldn't update correctly. Reports weren't showing up in their new status tabs.

## Root Cause
The `filterTabs` array was calculating counts by filtering the `reports` state array, which only contained reports for the currently active tab. For example:
- When viewing "Verified" tab, `reports` only contained verified reports
- Counting `reports.filter(r => r.status === "resolved")` would always return 0
- Tab badges showed incorrect counts (usually 0 for non-active tabs)

## Solution
Implemented separate status count tracking:

### Changes Made to `frontend/src/pages/moderator/ReportQueue.jsx`

1. **Added `statusCounts` state**:
   ```javascript
   const [statusCounts, setStatusCounts] = useState({
       reported: 0,
       verified: 0,
       resolved: 0,
       invalid: 0
   });
   ```

2. **Created `fetchStatusCounts` function**:
   - Fetches counts for all 4 statuses in parallel using `Promise.all()`
   - Uses the pagination.total from each response
   - Updates the `statusCounts` state
   ```javascript
   const fetchStatusCounts = async () => {
       const statuses = ['reported', 'verified', 'resolved', 'invalid'];
       const countPromises = statuses.map(status =>
           apiClient.get("/moderation/reports", {
               params: { status, limit: 1 }
           })
       );
       
       const responses = await Promise.all(countPromises);
       const counts = {};
       
       statuses.forEach((status, index) => {
           counts[status] = responses[index].data.data.pagination?.total || 0;
       });
       
       setStatusCounts(counts);
   };
   ```

3. **Updated `useEffect` to fetch counts**:
   ```javascript
   useEffect(() => {
       fetchReports();
       fetchStatusCounts();  // Added this
   }, [filter]);
   ```

4. **Updated `handleStatusUpdate` to refresh counts**:
   ```javascript
   const handleStatusUpdate = async (reportId, newStatus) => {
       await apiClient.patch(`/moderation/reports/${reportId}`, { status: newStatus });
       fetchReports();
       fetchStatusCounts();  // Added this
   };
   ```

5. **Updated `filterTabs` to use `statusCounts`**:
   ```javascript
   const filterTabs = [
       { label: "Reported", value: "reported", count: statusCounts.reported },
       { label: "Verified", value: "verified", count: statusCounts.verified },
       { label: "Resolved", value: "resolved", count: statusCounts.resolved },
       { label: "Invalid", value: "invalid", count: statusCounts.invalid },
   ];
   ```

## How It Works Now

1. **Initial Load**:
   - Fetches reports for the active tab (e.g., "Verified")
   - Fetches counts for ALL statuses in parallel
   - Tab badges show accurate counts for all tabs

2. **Status Update**:
   - User clicks "Mark Resolved" on a verified report
   - Backend updates the report status to "resolved"
   - Frontend refreshes both:
     - Current tab's reports (verified report disappears)
     - All status counts (verified count decreases, resolved count increases)

3. **Tab Navigation**:
   - User clicks "Resolved" tab
   - Fetches resolved reports
   - Refreshes counts (ensures accuracy)
   - Shows the newly resolved report

## Benefits

✅ **Accurate Counts**: Tab badges always show correct numbers
✅ **Real-time Updates**: Counts update immediately after status changes
✅ **Better UX**: Users can see how many reports are in each status
✅ **Performance**: Uses `limit: 1` to minimize data transfer when fetching counts

## Testing Checklist

- [x] Mark a reported report as verified → count moves from "Reported" to "Verified"
- [x] Mark a verified report as resolved → count moves from "Verified" to "Resolved"
- [x] Mark a reported report as invalid → count moves from "Reported" to "Invalid"
- [x] Switch between tabs → reports appear in correct tabs
- [x] All tab badges show correct counts at all times

## Status
✅ **COMPLETE** - Report Queue tab counts now work correctly for all status transitions
