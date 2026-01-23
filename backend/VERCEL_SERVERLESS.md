# Vercel Serverless Function Configuration

This backend is configured to run as a Vercel serverless function.

## Structure

```
backend/
├── api/
│   └── index.js          # Serverless function entry point
├── src/
│   ├── app.js            # Express app (for local development)
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   └── utils/
├── index.js              # Local development server
├── vercel.json           # Vercel configuration
└── package.json
```

## How It Works

### Serverless Function (`api/index.js`)
- Entry point for all requests in Vercel
- Handles database connection caching
- Includes all routes and middleware
- Optimized for serverless environment

### Local Development (`index.js` + `src/app.js`)
- Traditional Express server
- Includes Socket.io support
- Hot reload with nodemon

## Environment Variables

### Required for Production
```bash
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Recommended
```bash
CLERK_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
AWS_REGION=us-east-1
```

### Optional
```bash
REDIS_HOST=...
REDIS_PORT=6379
MAPBOX_ACCESS_TOKEN=...
EMAIL_HOST=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

## Deployment to Vercel

### 1. Set Environment Variables in Vercel Dashboard
Go to your project settings → Environment Variables and add:
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_WEBHOOK_SECRET`
- `MONGODB_URI`
- `FRONTEND_URL`
- `AWS_ACCESS_KEY_ID` (if using file uploads)
- `AWS_SECRET_ACCESS_KEY` (if using file uploads)

### 2. Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or push to your connected Git repository for automatic deployment.

## Key Differences from Traditional Deployment

1. **No Socket.io**: WebSocket connections are not supported in serverless functions
2. **Database Connection Caching**: Connections are cached to avoid cold start delays
3. **Stateless**: Each request is independent
4. **10-second timeout**: Functions have a maximum execution time (configurable)

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production build locally
npm start
```

## Troubleshooting

### "Missing required environment variables"
- Ensure all required variables are set in Vercel dashboard
- Check that variable names match exactly (case-sensitive)

### "Function timeout"
- Increase `maxDuration` in `vercel.json`
- Optimize database queries
- Add indexes to MongoDB collections

### "Database connection failed"
- Verify MongoDB URI is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check if IP whitelist is configured

## Performance Tips

1. **Use MongoDB Atlas**: Better for serverless than self-hosted
2. **Enable Connection Pooling**: Already configured in `db/connection.js`
3. **Add Database Indexes**: Improves query performance
4. **Minimize Cold Starts**: Keep functions warm with periodic health checks
