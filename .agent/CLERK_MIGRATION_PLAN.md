# Clerk Authentication Migration Plan

## Overview
Migrating from custom JWT authentication to Clerk Auth while maintaining Leaflet maps.

## Phase 1: Backend Setup

### 1.1 Install Dependencies
```bash
cd backend
npm install @clerk/clerk-sdk-node svix
```

### 1.2 Environment Variables
Add to `backend/.env`:
```
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

### 1.3 Create Clerk Middleware
- Create `backend/src/middlewares/clerk.js`
- Replace JWT verification with Clerk session verification
- Keep role-based authorization logic

### 1.4 Update User Model
- Add `clerkId` field (unique, required)
- Keep existing fields for campus association
- Remove password-related fields (handled by Clerk)

### 1.5 Create Webhook Handler
- Create `backend/src/controllers/clerk-webhook.controller.js`
- Handle user.created, user.updated, user.deleted events
- Sync Clerk users with MongoDB

### 1.6 Update Routes
- Remove password-based auth routes (login, register, reset)
- Add webhook endpoint
- Update protected routes to use Clerk middleware

## Phase 2: Frontend Setup

### 2.1 Install Dependencies
```bash
cd frontend
npm install @clerk/clerk-react
```

### 2.2 Environment Variables
Add to `frontend/.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

### 2.3 Wrap App with ClerkProvider
- Update `frontend/src/main.jsx`
- Add ClerkProvider with routing

### 2.4 Replace Auth Components
- Remove custom Login/Register pages
- Use Clerk's SignIn/SignUp components
- Add custom campus code field via metadata

### 2.5 Update API Client
- Modify `frontend/src/services/api.js`
- Use Clerk session tokens instead of custom JWT
- Auto-refresh tokens

### 2.6 Update Auth Store
- Replace custom auth state with Clerk hooks
- Use `useUser()`, `useAuth()` from Clerk

## Phase 3: Custom Campus Integration

### 3.1 Campus Code Validation
- Add custom field in Clerk sign-up
- Validate campus code via backend webhook
- Store campus association in user metadata

### 3.2 Role Management
- Use Clerk's publicMetadata for roles
- Sync roles between Clerk and MongoDB
- Implement role-based UI rendering

## Phase 4: Migration & Testing

### 4.1 Data Migration
- Create script to migrate existing users
- Generate Clerk users for existing accounts
- Send password reset emails

### 4.2 Testing Checklist
- [ ] User registration with campus code
- [ ] User login/logout
- [ ] Protected routes
- [ ] Role-based access (Student, Moderator, Admin)
- [ ] Campus isolation
- [ ] Report creation/viewing
- [ ] Map functionality (unchanged)

## Phase 5: Cleanup

### 5.1 Remove Old Code
- Delete custom JWT utilities
- Remove password hashing functions
- Clean up old auth controllers
- Remove unused dependencies

### 5.2 Update Documentation
- Update README with Clerk setup
- Document environment variables
- Add Clerk dashboard configuration guide

## Notes

### Leaflet Integration
- **No changes needed** - Leaflet is already properly integrated
- Maps will continue to work as-is
- Location services remain unchanged

### Key Differences
- **Before**: Custom JWT + bcrypt passwords
- **After**: Clerk managed authentication
- **Benefits**: 
  - OAuth providers (Google, GitHub, etc.)
  - Built-in UI components
  - Session management
  - Security updates handled by Clerk
  - Multi-factor authentication support

### Rollback Plan
- Keep old code in git history
- Test thoroughly before deployment
- Have database backup ready
- Staged rollout (dev → staging → production)
