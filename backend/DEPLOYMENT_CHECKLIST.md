# ✅ Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

---

## 📋 PRE-DEPLOYMENT

### Code Preparation
- [x] All code changes committed
- [x] `vercel.json` configuration file created
- [x] `.vercelignore` file created
- [x] Socket.io conditionally disabled for Vercel
- [x] Rate limiter configured for production
- [x] Environment validation in place

### Documentation
- [x] Production readiness assessment completed
- [x] Deployment guide created
- [x] Quick reference available
- [x] Known limitations documented

### Local Testing
- [ ] Run `node validate-deployment.js`
- [ ] Verify all imports use `.js` extensions
- [ ] Check `package.json` has `"type": "module"`
- [ ] Ensure no syntax errors

---

## 🔐 ENVIRONMENT VARIABLES

### Required Variables (Set in Vercel Dashboard)
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` (your MongoDB connection string)
- [ ] `CLERK_SECRET_KEY`
- [ ] `CLERK_PUBLISHABLE_KEY`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION`
- [ ] `FRONTEND_URL` (your frontend URL)

### Optional Variables
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`
- [ ] `EMAIL_FROM`
- [ ] `CLERK_WEBHOOK_SECRET`

### Verify
- [ ] All required variables are set
- [ ] No typos in variable names
- [ ] Values are correct (no placeholder text)
- [ ] Frontend URL matches actual frontend domain

---

## 🗄️ DATABASE SETUP

### MongoDB Atlas Configuration
- [ ] MongoDB Atlas account created
- [ ] Cluster is running
- [ ] Database user created
- [ ] Network access configured:
  - [ ] Add `0.0.0.0/0` to IP whitelist (for Vercel)
- [ ] Connection string copied
- [ ] Connection string tested locally

### Database Indexes
- [ ] Geospatial indexes will be created automatically
- [ ] Monitor index creation in logs after first deploy

---

## 🔑 AUTHENTICATION SETUP

### Clerk Configuration
- [ ] Clerk account created
- [ ] Application created in Clerk dashboard
- [ ] API keys copied (Secret & Publishable)
- [ ] Webhook endpoint configured (if using webhooks)
- [ ] Allowed redirect URLs updated with Vercel domain

---

## ☁️ AWS S3 SETUP

### S3 Configuration
- [ ] AWS account created (or using dummy keys for testing)
- [ ] S3 bucket created (if using real S3)
- [ ] IAM user created with S3 permissions
- [ ] Access keys generated
- [ ] Bucket CORS configured for your frontend domain

**Note:** You can deploy with dummy keys initially for testing.

---

## 🚀 DEPLOYMENT PROCESS

### Option A: Vercel Dashboard
- [ ] Code pushed to GitHub
- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository
- [ ] Set root directory to `backend`
- [ ] Add all environment variables
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete

### Option B: Vercel CLI
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Navigate to backend directory
- [ ] Run: `vercel` (for preview)
- [ ] Run: `vercel --prod` (for production)
- [ ] Add environment variables when prompted

---

## 🧪 POST-DEPLOYMENT TESTING

### Basic Health Checks
- [ ] Health endpoint responds: `curl https://your-backend.vercel.app/health`
  - [ ] Returns `"status": "OK"`
  - [ ] Shows `"socketio": "disabled"`
  - [ ] Shows `"deployment": "vercel"`

### API Endpoint Testing
- [ ] Root endpoint works: `curl https://your-backend.vercel.app/`
- [ ] Public endpoints accessible
- [ ] Protected endpoints return 401 without auth
- [ ] CORS headers present in responses

### Database Connection
- [ ] Check Vercel logs for "MongoDB Connected" message
- [ ] No connection timeout errors
- [ ] Geospatial indexes created successfully

### Authentication
- [ ] Login flow works from frontend
- [ ] JWT tokens are generated
- [ ] Protected routes require authentication
- [ ] User data is retrieved correctly

### File Uploads (if using real S3)
- [ ] Upload endpoint accepts files
- [ ] Files are stored in S3
- [ ] File URLs are accessible
- [ ] CORS allows frontend access

---

## 📊 MONITORING & LOGS

### Vercel Dashboard
- [ ] Check "Functions" tab for errors
- [ ] Review deployment logs
- [ ] Monitor function execution time
- [ ] Check bandwidth usage

### Database Monitoring
- [ ] MongoDB Atlas metrics look normal
- [ ] No connection pool exhaustion
- [ ] Query performance is acceptable

### Error Tracking (Optional but Recommended)
- [ ] Set up Sentry or similar service
- [ ] Configure error reporting
- [ ] Test error notifications

---

## ⚠️ KNOWN LIMITATIONS ACKNOWLEDGED

- [ ] Understand Socket.io is disabled
- [ ] Know that real-time features won't work
- [ ] Aware of rate limiting limitations
- [ ] Understand cold start delays (1-3 seconds)

---

## 🔧 TROUBLESHOOTING CHECKLIST

If deployment fails, check:

### Common Issues
- [ ] All environment variables are set correctly
- [ ] MongoDB connection string is valid
- [ ] MongoDB Atlas allows Vercel IPs (0.0.0.0/0)
- [ ] No syntax errors in code
- [ ] All imports use `.js` extensions
- [ ] `package.json` has `"type": "module"`

### Vercel-Specific Issues
- [ ] Root directory is set to `backend`
- [ ] `vercel.json` is valid JSON
- [ ] No files are too large (>50MB)
- [ ] Function timeout is within limits (10s for Hobby)

### Database Issues
- [ ] Connection string includes database name
- [ ] Network access allows all IPs
- [ ] Database user has correct permissions
- [ ] No firewall blocking connections

---

## 📈 PERFORMANCE OPTIMIZATION

### After Initial Deployment
- [ ] Monitor cold start times
- [ ] Check function execution duration
- [ ] Review database query performance
- [ ] Optimize slow endpoints

### Recommended Optimizations
- [ ] Add database indexes for frequently queried fields
- [ ] Implement response caching where appropriate
- [ ] Reduce serverless function bundle size
- [ ] Consider Vercel Pro for better performance

---

## 🔐 SECURITY CHECKLIST

### Verify Security Measures
- [ ] HTTPS is enforced (Vercel default)
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Helmet security headers are present
- [ ] Input validation is working
- [ ] Authentication is required for protected routes
- [ ] No sensitive data in logs
- [ ] Environment variables are not exposed

---

## 📱 FRONTEND INTEGRATION

### Update Frontend
- [ ] Update API base URL to Vercel deployment URL
- [ ] Test all API calls from frontend
- [ ] Verify authentication flow
- [ ] Check CORS is working
- [ ] Test file uploads (if applicable)
- [ ] Verify error handling

---

## 🎯 FINAL VERIFICATION

### Before Going Live
- [ ] All tests pass
- [ ] No errors in Vercel logs
- [ ] Database connection stable
- [ ] Authentication working
- [ ] API endpoints responding correctly
- [ ] CORS configured properly
- [ ] Rate limiting active
- [ ] Error handling working

### Documentation
- [ ] Team knows about Socket.io limitation
- [ ] Alternative for real-time features planned
- [ ] Monitoring strategy in place
- [ ] Backup strategy defined

---

## ✅ DEPLOYMENT COMPLETE!

### Post-Deployment Tasks
- [ ] Update frontend with production API URL
- [ ] Test complete user flow
- [ ] Monitor for 24 hours
- [ ] Set up alerts for errors
- [ ] Document any issues encountered

### Next Steps
- [ ] Plan Socket.io alternative deployment
- [ ] Set up Upstash Redis for global rate limiting
- [ ] Implement comprehensive monitoring
- [ ] Add API documentation (Swagger)
- [ ] Set up automated backups

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Clerk Docs:** https://clerk.com/docs
- **Project Docs:** See `DEPLOYMENT_SUMMARY.md`

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:
- ✅ Health endpoint returns 200 OK
- ✅ All API endpoints respond correctly
- ✅ Database connection is stable
- ✅ Authentication works from frontend
- ✅ No errors in Vercel logs
- ✅ Frontend can communicate with backend

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Vercel URL:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Status:** [ ] Deployed Successfully  [ ] Issues Encountered

**Next Review Date:** _________________
