# 🚀 Quick Reference Card

## Environment Variables

### Backend (.env)
```bash
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
MONGODB_URI=mongodb://...
```

### Frontend (.env)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000
```

## Common Commands

### Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Expose webhook (development)
ngrok http 5000
```

### Database
```bash
# Seed data
cd backend
node src/seed.js

# MongoDB shell
mongosh
use campus-safety
db.users.find()
db.campuses.find()
```

## Important URLs

### Development
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Health: http://localhost:5000/health

### Clerk Dashboard
- Dashboard: https://dashboard.clerk.com
- API Keys: https://dashboard.clerk.com/last-active?path=api-keys
- Webhooks: https://dashboard.clerk.com/last-active?path=webhooks

## File Locations

### Backend
```
backend/
├── src/
│   ├── middlewares/clerk.js           # Auth middleware
│   ├── controllers/
│   │   └── clerk-webhook.controller.js # Webhook handler
│   └── routes/webhook.routes.js       # Webhook routes
└── .env                               # Environment config
```

### Frontend
```
frontend/
├── src/
│   ├── pages/
│   │   ├── ClerkSignIn.jsx           # Sign-in page
│   │   └── ClerkSignUp.jsx           # Sign-up page
│   └── components/
│       ├── ProtectedRoute.jsx        # Auth guard
│       └── ApiClientInitializer.jsx  # API setup
└── .env                              # Environment config
```

## Webhook Events

```javascript
// user.created - New user registered
{
  type: "user.created",
  data: {
    id: "user_...",
    email_addresses: [...],
    public_metadata: {
      campusCode: "UCLA2024"
    }
  }
}

// user.updated - User info changed
{
  type: "user.updated",
  data: { ... }
}

// user.deleted - User deleted
{
  type: "user.deleted",
  data: { ... }
}
```

## API Endpoints

### Authentication (Clerk)
- Sign In: `/login` (Clerk component)
- Sign Up: `/register` (Clerk component)
- Sign Out: Clerk's `signOut()` method

### Reports
- GET `/reports` - List reports
- POST `/reports` - Create report
- GET `/reports/:id` - Get report
- GET `/reports/nearby` - Nearby reports

### Users
- GET `/users/me` - Current user
- PATCH `/users/me` - Update profile

## Clerk Hooks (Frontend)

```javascript
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';

// Get auth state
const { isSignedIn, userId } = useAuth();

// Get user data
const { user } = useUser();

// Get Clerk methods
const { signOut } = useClerk();
```

## MongoDB Queries

```javascript
// Find user by Clerk ID
db.users.findOne({ clerkId: "user_..." })

// Find campus by code
db.campuses.findOne({ code: "UCLA2024" })

// Find nearby reports
db.reports.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-118.4452, 34.0689]
      },
      $maxDistance: 500
    }
  }
})
```

## Troubleshooting

### "Missing Clerk Publishable Key"
```bash
# Check .env files exist
ls backend/.env
ls frontend/.env

# Restart servers
```

### Webhook Not Working
```bash
# Check ngrok is running
ngrok http 5000

# Verify URL in Clerk dashboard
# Check backend logs
```

### User Not Created
```bash
# Check webhook logs in Clerk dashboard
# Check backend console
# Verify MongoDB connection
```

## Testing Checklist

- [ ] User can register with campus code
- [ ] User receives verification email
- [ ] User can log in
- [ ] Protected routes work
- [ ] API requests include token
- [ ] Maps display correctly
- [ ] Reports can be created
- [ ] Webhooks sync user data

## Campus Codes (After Seeding)

Default test codes:
- `UCLA2024` - UCLA
- `MIT2024` - MIT
- `STANFORD2024` - Stanford

## Security Notes

- ⚠️ Never commit `.env` files
- ⚠️ Use test keys in development
- ⚠️ Rotate secrets regularly
- ⚠️ Enable 2FA for admin accounts
- ⚠️ Monitor Clerk dashboard for suspicious activity

## Support Resources

📚 Documentation:
- [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)
- [CLERK_SETUP_GUIDE.md](./CLERK_SETUP_GUIDE.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)

🔗 External:
- Clerk Docs: https://clerk.com/docs
- Leaflet Docs: https://leafletjs.com
- MongoDB Docs: https://docs.mongodb.com

## Quick Fixes

### Clear Clerk Session
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Reset Database
```bash
cd backend
mongosh
use campus-safety
db.dropDatabase()
node src/seed.js
```

### Regenerate Clerk Keys
1. Go to Clerk Dashboard
2. API Keys → Regenerate
3. Update .env files
4. Restart servers

---

**Keep this card handy for quick reference!** 📌
