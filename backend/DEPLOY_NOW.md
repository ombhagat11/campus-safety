# Quick Deployment Guide for Vercel

## ✅ What We Fixed

1. **Created serverless function**: `backend/api/index.js`
2. **Updated vercel.json**: Modern configuration for serverless
3. **Fixed environment variables**: Added missing `CLERK_PUBLISHABLE_KEY`
4. **Optimized validation**: More flexible for serverless deployment

## 🚀 Deploy to Vercel

### Option 1: Using Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Import your Git repository**
3. **Configure Project**:
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

4. **Add Environment Variables**:
   ```
   CLERK_SECRET_KEY=sk_test_ooCzSmvSQQZQ8ZTI4oFvhOiJObhpx3YXDe3hVszV5L
   CLERK_PUBLISHABLE_KEY=pk_test_dmVyaWZpZWQtZXNjYXJnb3QtNzcuY2xlcmsuYWNjb3VudHMuZGV2JA
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
   MONGODB_URI=mongodb+srv://tukeshkumar1703_db_user:mcHuw3PreKvOP7sh@cluster0.inhnu8h.mongodb.net/?appName=Cluster0
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   AWS_ACCESS_KEY_ID=dummy-key
   AWS_SECRET_ACCESS_KEY=dummy-secret
   AWS_BUCKET_NAME=campus-safety-dev
   AWS_REGION=us-east-1
   ```

5. **Click Deploy**

### Option 2: Using Vercel CLI

```bash
# Navigate to backend directory
cd "c:\Users\omprakash\Music\Campus Saftey\backend"

# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🔧 Setting Environment Variables via CLI

```bash
# Set each variable
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_PUBLISHABLE_KEY production
vercel env add MONGODB_URI production
vercel env add FRONTEND_URL production
# ... add others as needed

# Or import from .env file
vercel env pull .env.production
```

## 📋 Required Environment Variables

**Critical (Must have)**:
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `MONGODB_URI`
- `NODE_ENV=production`
- `FRONTEND_URL`

**Recommended**:
- `CLERK_WEBHOOK_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## ✨ What Changed

### Before (Not Working)
```json
{
  "version": 2,
  "builds": [{"src": "index.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "index.js"}]
}
```
❌ Used deprecated configuration
❌ Missing CLERK_PUBLISHABLE_KEY
❌ No serverless optimization

### After (Working)
```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/api"}],
  "functions": {
    "api/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```
✅ Modern serverless configuration
✅ All required environment variables
✅ Database connection caching
✅ Optimized for serverless

## 🧪 Test Your Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-app.vercel.app/health

# Root endpoint
curl https://your-app.vercel.app/

# API endpoint
curl https://your-app.vercel.app/api/public/reports
```

## 🐛 Troubleshooting

### Error: "Missing required environment variables"
**Solution**: Add all required variables in Vercel dashboard under Settings → Environment Variables

### Error: "Function timeout"
**Solution**: Increase `maxDuration` in `vercel.json` (max 60s on Pro plan, 10s on Hobby)

### Error: "Database connection failed"
**Solution**: 
1. Check MongoDB URI is correct
2. Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
3. Ensure database user has correct permissions

### Error: "CORS issues"
**Solution**: Update `FRONTEND_URL` environment variable to match your frontend domain

## 📊 Monitor Your Deployment

- **Logs**: Vercel Dashboard → Your Project → Deployments → View Function Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Performance**: Check response times in Function Logs

## 🔄 Redeploy

After making changes:
```bash
git add .
git commit -m "Update backend"
git push
```

Vercel will automatically redeploy on push to main branch.

Or manually:
```bash
vercel --prod
```

## 📝 Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Update frontend `VITE_API_URL` to point to your Vercel backend URL
3. ✅ Test all API endpoints
4. ✅ Set up proper webhook secret for Clerk
5. ✅ Configure AWS S3 for file uploads (if needed)
6. ✅ Set up monitoring and alerts
