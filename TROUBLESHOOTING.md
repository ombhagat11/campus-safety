# 🔧 REPORT SUBMISSION TROUBLESHOOTING GUIDE

## 🎯 Current Issues

1. **Report submission failing** - "Failed to create report. Please try again"
2. **Reports feed not showing all incidents**

## 🔍 Debugging Steps

### Step 1: Check Backend Logs

The backend now has detailed logging. Look at the terminal running the backend:

```bash
# You should see:
=== CREATE REPORT REQUEST ===
User ID: [user id]
User: [email]
Campus ID: [campus id]
Request Body: [json data]
```

**What to look for:**
- ❌ If you see "Invalid location" → Location format is wrong
- ❌ If you see validation error → Check the error message
- ❌ If you see database error → Check MongoDB connection
- ✅ If you see "Report created successfully" → It worked!

### Step 2: Check Browser Console

Open DevTools (F12) and check:

1. **Console Tab:**
   - Look for error messages
   - Check if API calls are being made

2. **Network Tab:**
   - Find the POST request to `/reports`
   - Check the **Request Payload**
   - Check the **Response**

### Step 3: Verify Data Format

Your current report data:
```
Title: "Om" (2 chars) ❌ TOO SHORT!
Description: "efefefr" (7 chars) ✓
Category: "assault" ✓
Severity: 4 ✓
```

**Problem:** Title is only 2 characters, but minimum is 3!

## ✅ Quick Fix

### Fix 1: Make Title Longer

Change "Om" to "Omm" or any 3+ character title.

**Minimum Requirements:**
- Title: 3 characters
- Description: 3 characters
- Category: Must be valid
- Severity: 1-5
- Location: Must have coordinates

### Fix 2: Check Browser Cache

Hard refresh the browser:
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Fix 3: Check Authentication

Make sure you're logged in:
1. Check if you see your name in the top right
2. Try logging out and back in
3. Check if token is valid

## 🐛 Common Errors & Solutions

### Error: "Validation failed"
**Cause:** Data doesn't meet validation requirements

**Solutions:**
1. Title must be 3+ characters
2. Description must be 3+ characters
3. Category must be one of: theft, assault, harassment, vandalism, suspicious_activity, emergency, fire, medical, other
4. Severity must be 1-5
5. Location must have [longitude, latitude]

### Error: "Failed to create report"
**Cause:** Server error or database issue

**Solutions:**
1. Check backend terminal for errors
2. Check MongoDB is running
3. Check network connection
4. Try again in a few seconds

### Error: "No token provided"
**Cause:** Not authenticated

**Solutions:**
1. Log out and log back in
2. Clear browser cache
3. Check if session expired

## 📊 Reports Feed Not Showing

### Possible Causes:

1. **No reports created yet**
   - Create a test report first
   - Check if it appears

2. **Different campus**
   - Reports are campus-isolated
   - You only see reports from your campus
   - Check if you're on the right campus

3. **API not returning data**
   - Check browser console for errors
   - Check Network tab for API calls
   - Verify GET /reports is being called

4. **Frontend not rendering**
   - Hard refresh browser
   - Check React errors in console

### Debug Reports Feed:

Open browser console and run:
```javascript
// Check if reports are being fetched
fetch('/api/reports', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
})
.then(r => r.json())
.then(d => console.log('Reports:', d))
```

## 🔧 Manual Test

### Test Report Creation via API:

1. Get your access token:
   - Open DevTools → Application → Local Storage
   - Find `accessToken`
   - Copy the value

2. Test in browser console:
```javascript
fetch('http://localhost:5000/api/reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    title: "Test Report",
    description: "Testing the system",
    category: "theft",
    severity: 3,
    location: {
      type: "Point",
      coordinates: [75.824500, 22.682600]
    },
    mediaUrls: [],
    isAnonymous: false
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
```

## 📋 Checklist Before Submitting

- [ ] Title is 3+ characters
- [ ] Description is 3+ characters
- [ ] Category is selected
- [ ] Severity is set (1-5)
- [ ] Location is selected on map
- [ ] You are logged in
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] MongoDB is running
- [ ] Browser cache is cleared

## 🚀 Next Steps

1. **Check backend terminal** for detailed logs
2. **Check browser console** for errors
3. **Make title 3+ characters**
4. **Try submitting again**
5. **Check reports feed** after successful submission

## 💡 Pro Tips

1. **Always check backend logs first** - They show exactly what's happening
2. **Use browser DevTools Network tab** - See actual requests/responses
3. **Test with simple data first** - Use "Test", "Testing", etc.
4. **One issue at a time** - Fix validation, then test submission
5. **Hard refresh often** - Clear cache to get latest code

## 📞 Still Not Working?

If you've tried everything:

1. **Restart backend server:**
   ```bash
   # Stop: Ctrl+C
   # Start: npm run dev
   ```

2. **Restart frontend server:**
   ```bash
   # Stop: Ctrl+C
   # Start: npm run dev
   ```

3. **Clear all browser data:**
   - DevTools → Application → Clear Storage
   - Click "Clear site data"

4. **Check MongoDB:**
   ```bash
   # Make sure MongoDB is running
   # Check connection string in .env
   ```

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Backend logs show "Report created successfully"
- ✅ Browser shows success alert
- ✅ Redirected to dashboard
- ✅ Report appears in feed
- ✅ Report appears on map

---

**Most likely issue:** Title "Om" is only 2 characters. Change to "Omm" or longer! 🎯
