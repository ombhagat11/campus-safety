# Campus Safety Architecture with Clerk & Leaflet

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Frontend                         │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │   Clerk     │  │   Leaflet    │  │  API Client    │  │  │
│  │  │  Provider   │  │    Maps      │  │  (Axios)       │  │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │  │
│  │         │               │                    │           │  │
│  └─────────┼───────────────┼────────────────────┼───────────┘  │
│            │               │                    │              │
└────────────┼───────────────┼────────────────────┼──────────────┘
             │               │                    │
             │               │                    │ Bearer Token
             │               │                    ▼
             │               │         ┌──────────────────────┐
             │               │         │   Express Backend    │
             │               │         │                      │
             │               │         │  ┌────────────────┐  │
             │               │         │  │ Clerk          │  │
             │               │         │  │ Middleware     │  │
             │               │         │  └────────────────┘  │
             │               │         │          │           │
             │               │         │  ┌────────────────┐  │
             │               │         │  │ Route          │  │
             │               │         │  │ Controllers    │  │
             │               │         │  └────────────────┘  │
             │               │         │          │           │
             │               │         └──────────┼───────────┘
             │               │                    │
             │               │                    ▼
             │               │         ┌──────────────────────┐
             │               │         │      MongoDB         │
             │               │         │                      │
             │               │         │  ┌────────────────┐  │
             │               │         │  │ Users          │  │
             │               │         │  │ Reports        │  │
             │               │         │  │ Campuses       │  │
             │               └────────▶│  │ (GeoSpatial)   │  │
             │                         │  └────────────────┘  │
             │                         └──────────────────────┘
             │
             ▼
    ┌──────────────────┐
    │   Clerk.com      │
    │                  │
    │  ┌────────────┐  │
    │  │   Users    │  │
    │  │  Sessions  │  │
    │  │   Tokens   │  │
    │  └────────────┘  │
    │        │         │
    │        │ Webhook │
    │        ▼         │
    │  ┌────────────┐  │
    │  │  Events:   │  │
    │  │  - created │  │
    │  │  - updated │──┼──────────────┐
    │  │  - deleted │  │              │
    │  └────────────┘  │              │
    └──────────────────┘              │
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │  Webhook Endpoint    │
                           │  /webhooks/clerk     │
                           │                      │
                           │  Syncs user data     │
                           │  to MongoDB          │
                           └──────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  User    │                                    │  Clerk   │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │  1. Click "Sign Up"                          │
     ├──────────────────────────────────────────────▶
     │                                               │
     │  2. Enter campus code + email/password       │
     ├──────────────────────────────────────────────▶
     │                                               │
     │  3. Clerk creates user                       │
     │  ◀──────────────────────────────────────────┤
     │                                               │
     │  4. Webhook: user.created                    │
     │                                               ├───────┐
     │                                               │       │
     │                                               │       ▼
     │                                          ┌────┴──────────┐
     │                                          │   Backend     │
     │                                          │               │
     │                                          │ 5. Validate   │
     │                                          │    campus     │
     │                                          │    code       │
     │                                          │               │
     │                                          │ 6. Create     │
     │                                          │    user in    │
     │                                          │    MongoDB    │
     │                                          └───────────────┘
     │
     │  7. Email verification sent
     ◀──────────────────────────────────────────────┤
     │                                               │
     │  8. Click verification link                  │
     ├──────────────────────────────────────────────▶
     │                                               │
     │  9. User verified                            │
     │  ◀──────────────────────────────────────────┤
     │                                               │
     │  10. Redirect to dashboard                   │
     ◀──────────────────────────────────────────────┤
     │                                               │
```

## API Request Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Frontend │         │  Clerk   │         │ Backend  │         │ MongoDB  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Get token       │                    │                    │
     ├───────────────────▶│                    │                    │
     │                    │                    │                    │
     │ 2. Return JWT      │                    │                    │
     │◀───────────────────┤                    │                    │
     │                    │                    │                    │
     │ 3. API request with Bearer token        │                    │
     ├────────────────────┼───────────────────▶│                    │
     │                    │                    │                    │
     │                    │ 4. Verify token    │                    │
     │                    │◀───────────────────┤                    │
     │                    │                    │                    │
     │                    │ 5. Token valid     │                    │
     │                    ├───────────────────▶│                    │
     │                    │                    │                    │
     │                    │                    │ 6. Query DB        │
     │                    │                    ├───────────────────▶│
     │                    │                    │                    │
     │                    │                    │ 7. Return data     │
     │                    │                    │◀───────────────────┤
     │                    │                    │                    │
     │ 8. Return response │                    │                    │
     │◀───────────────────┼────────────────────┤                    │
     │                    │                    │                    │
```

## Map Integration (Leaflet)

```
┌──────────────────────────────────────────────────────────┐
│                    Map Component                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Leaflet Map                           │ │
│  │                                                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │ Marker 1 │  │ Marker 2 │  │ Marker 3 │  ...   │ │
│  │  │ (Theft)  │  │ (Assault)│  │ (Fire)   │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  │                                                    │ │
│  │  Marker Clustering: Groups nearby markers         │ │
│  │  Custom Icons: Based on severity (1-5)            │ │
│  │  Popups: Show report details on click             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Data Flow:                                              │
│  1. Fetch reports from API                               │
│  2. Filter by geospatial proximity                       │
│  3. Render markers on map                                │
│  4. Update in real-time via Socket.io                    │
└──────────────────────────────────────────────────────────┘
```

## Geospatial Query

```
MongoDB 2dsphere Index:

┌─────────────────────────────────────────┐
│         Campus Boundary                 │
│                                         │
│    User Location (center)               │
│           ●                             │
│          ╱│╲                            │
│         ╱ │ ╲  500m radius              │
│        ╱  │  ╲                          │
│       ╱   │   ╲                         │
│      ╱    │    ╲                        │
│     ●─────┼─────●                       │
│    ╱      │      ╲                      │
│   ╱       │       ╲                     │
│  ●────────●────────●                    │
│  ↑        ↑        ↑                    │
│  Reports within radius                  │
│                                         │
│  Query: db.reports.find({              │
│    location: {                          │
│      $near: {                           │
│        $geometry: {                     │
│          type: "Point",                 │
│          coordinates: [lng, lat]        │
│        },                               │
│        $maxDistance: 500                │
│      }                                  │
│    }                                    │
│  })                                     │
└─────────────────────────────────────────┘
```

## Data Models

```
┌─────────────────────────────────────────────────────────┐
│                      User Model                         │
├─────────────────────────────────────────────────────────┤
│ clerkId: String (unique)          ← From Clerk          │
│ email: String                                           │
│ name: String                                            │
│ campusId: ObjectId                ← Links to Campus     │
│ role: String                      ← student/mod/admin   │
│ isVerified: Boolean               ← Synced from Clerk   │
│ profileImage: String              ← From Clerk          │
│ isActive: Boolean                                       │
│ isBanned: Boolean                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Report Model                         │
├─────────────────────────────────────────────────────────┤
│ title: String                                           │
│ description: String                                     │
│ category: String                  ← theft/assault/etc   │
│ severity: Number (1-5)                                  │
│ location: {                       ← GeoJSON Point       │
│   type: "Point",                                        │
│   coordinates: [lng, lat]                               │
│ }                                                       │
│ reporterId: ObjectId              ← Links to User       │
│ campusId: ObjectId                ← Links to Campus     │
│ status: String                    ← pending/verified    │
│ photos: [String]                  ← S3 URLs             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Campus Model                         │
├─────────────────────────────────────────────────────────┤
│ name: String                                            │
│ code: String (unique)             ← For registration    │
│ location: {                       ← GeoJSON Point       │
│   type: "Point",                                        │
│   coordinates: [lng, lat]                               │
│ }                                                       │
│ stats: {                                                │
│   totalUsers: Number,                                   │
│   totalReports: Number,                                 │
│   totalModerators: Number                               │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Security Stack                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: Clerk Authentication                          │
│  ├─ JWT token verification                              │
│  ├─ Session management                                  │
│  └─ Password security                                   │
│                                                         │
│  Layer 2: Backend Middleware                            │
│  ├─ Clerk middleware (token verification)               │
│  ├─ Role-based access control (RBAC)                    │
│  └─ Campus isolation                                    │
│                                                         │
│  Layer 3: Database                                      │
│  ├─ MongoDB indexes                                     │
│  ├─ Data validation                                     │
│  └─ Audit logging                                       │
│                                                         │
│  Layer 4: Network                                       │
│  ├─ CORS configuration                                  │
│  ├─ Rate limiting                                       │
│  ├─ Helmet.js security headers                          │
│  └─ HTTPS (production)                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend                              │
├──────────────────────────────────────────────────────────┤
│  React 19              - UI framework                    │
│  Vite                  - Build tool                      │
│  TailwindCSS v4        - Styling                         │
│  @clerk/clerk-react    - Authentication                  │
│  Leaflet               - Maps                            │
│  react-leaflet         - React wrapper                   │
│  Axios                 - HTTP client                     │
│  Zustand               - State management                │
│  Socket.io-client      - Real-time updates               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    Backend                               │
├──────────────────────────────────────────────────────────┤
│  Node.js               - Runtime                         │
│  Express               - Web framework                   │
│  @clerk/clerk-sdk-node - Authentication                  │
│  Mongoose              - MongoDB ODM                     │
│  Socket.io             - Real-time                       │
│  AWS SDK               - File storage                    │
│  Nodemailer            - Email                           │
│  Helmet                - Security                        │
│  Joi                   - Validation                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   Infrastructure                         │
├──────────────────────────────────────────────────────────┤
│  MongoDB               - Database                        │
│  Clerk.com             - Auth service                    │
│  AWS S3                - File storage                    │
│  Redis (optional)      - Caching                         │
└──────────────────────────────────────────────────────────┘
```

## Key Differences: Before vs After

```
┌─────────────────────┬────────────────────┬─────────────────────┐
│     Feature         │   Before (JWT)     │   After (Clerk)     │
├─────────────────────┼────────────────────┼─────────────────────┤
│ Authentication      │ Custom JWT         │ Clerk managed       │
│ Password Storage    │ bcrypt             │ Clerk managed       │
│ Email Verification  │ Manual             │ Automatic           │
│ Password Reset      │ Manual             │ Automatic           │
│ OAuth Providers     │ ❌                 │ ✅                  │
│ 2FA                 │ ❌                 │ ✅                  │
│ Session Management  │ Manual             │ Automatic           │
│ Security Updates    │ Manual             │ Automatic           │
│ User Management UI  │ Custom             │ Clerk Dashboard     │
│ Maps (Leaflet)      │ ✅                 │ ✅ (unchanged)      │
└─────────────────────┴────────────────────┴─────────────────────┘
```
