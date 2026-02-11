# Campus Safety - Quick Interview Reference Card

## 🎯 30-Second Elevator Pitch
"Campus Safety is a full-stack MERN incident reporting platform with real-time geospatial tracking. Students report safety incidents with location, moderators verify them, and admins manage campuses. Key achievement: optimized MongoDB geospatial queries from 5s to <500ms using 2dsphere indexing."

---

## 📊 Project Stats
- **Tech Stack**: MERN (MongoDB, Express, React, Node.js)
- **Lines of Code**: ~15,000+
- **API Endpoints**: 40+
- **User Roles**: 3 (Student, Moderator, Admin)
- **Performance**: <500ms geospatial queries
- **Security**: Clerk auth + RBAC + JWT

---

## 🏗️ Architecture (One Line Each)

```
React 19 (Frontend) → Express.js (Backend) → MongoDB (Database)
                    ↓                      ↓
                  Clerk (Auth)        AWS S3 (Storage)
```

---

## 🔑 Core Features (Top 5)

1. **Geospatial Queries**: MongoDB 2dsphere index for nearby incidents (<500ms)
2. **RBAC**: 3-tier role system (student/moderator/admin)
3. **Real-Time Maps**: Leaflet with marker clustering
4. **Secure Uploads**: AWS S3 signed URLs
5. **Enterprise Auth**: Clerk (OAuth, 2FA, email verification)

---

## 💻 Tech Stack

### Frontend
- React 19 + Vite
- TailwindCSS v4
- Leaflet (maps)
- Zustand (state)
- Clerk React (auth)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Clerk SDK (auth)
- AWS S3 SDK (storage)
- Socket.io (real-time)

### Infrastructure
- Vercel (serverless hosting)
- MongoDB Atlas (database)
- AWS S3 (file storage)
- Clerk.com (authentication)

---

## 🔒 Security Layers

1. **Auth**: Clerk (JWT, OAuth, 2FA)
2. **Authorization**: RBAC middleware
3. **Validation**: Joi schemas
4. **Rate Limiting**: 5 reports/hour
5. **Data Protection**: Anonymous reporting, audit logs
6. **Network**: Helmet, CORS, HTTPS

---

## 📈 Key Achievements

### Performance Optimization
**Problem**: Geospatial queries took 5+ seconds
**Solution**: 
- Added 2dsphere index on location
- Compound index on campusId + location
- Pagination (limit 100)
**Result**: <500ms query time

### Authentication Migration
**Before**: Custom JWT (~2000 lines)
**After**: Clerk integration (~200 lines)
**Benefits**: OAuth, 2FA, email verification, session management

---

## 🗄️ Database Schema (Simplified)

```javascript
User {
  clerkId, email, name, campusId, role, isVerified
}

Report {
  title, description, category, severity (1-5),
  location: { type: 'Point', coordinates: [lng, lat] },
  reporterId, campusId, status, photos[], isAnonymous
}

Campus {
  name, code, location, stats, settings
}
```

**Key Indexes**:
- `Report.location` (2dsphere)
- `Report.campusId + location` (compound)
- `User.email` (unique)

---

## 🎨 Frontend Architecture

```
src/
├── components/
│   ├── common/      # Reusable UI
│   ├── Map/         # Map components
│   └── Reports/     # Report components
├── pages/           # Page components
├── hooks/           # Custom hooks
├── services/        # API services
└── stores/          # Zustand stores
```

**State Management**: Zustand (lightweight, persistent)

---

## 🚀 Deployment

- **Frontend**: Vercel (static hosting + CDN)
- **Backend**: Vercel (serverless functions)
- **Database**: MongoDB Atlas (managed)
- **Storage**: AWS S3 + CloudFront CDN
- **Auth**: Clerk (fully managed)

**Auto-scaling**: Serverless functions scale automatically

---

## 🐛 Top 3 Challenges & Solutions

### 1. Geospatial Performance
- **Challenge**: Slow queries (5s+)
- **Solution**: 2dsphere indexes, pagination
- **Result**: <500ms

### 2. Anonymous Reporting Privacy
- **Challenge**: Balance privacy vs accountability
- **Solution**: Hide reporterId from public API, store for audit, moderators can see
- **Result**: Privacy + abuse prevention

### 3. Real-Time Updates
- **Challenge**: Users had to refresh for new reports
- **Solution**: Socket.io integration (in progress)
- **Result**: Real-time map updates

---

## 📊 API Design Example

```javascript
GET /api/reports/nearby?lat=37.7749&lon=-122.4194&radius=1000

Response: {
  reports: [
    {
      _id: "...",
      title: "Bike theft",
      category: "theft",
      severity: 3,
      location: { type: "Point", coordinates: [-122.42, 37.77] },
      distance: 245, // meters
      status: "verified"
    }
  ],
  total: 15,
  page: 1
}
```

---

## 🔐 RBAC Implementation

```javascript
// Middleware
requireAuth → requireRole(['moderator', 'admin'])

// Route
router.patch('/reports/:id',
  requireAuth,
  requireRole(['moderator', 'admin']),
  updateReport
);

// Roles
Student: Create/edit own reports, view, vote, comment
Moderator: + Review, verify, ban users
Admin: + Manage campuses, users, analytics
```

---

## 🎯 Common Interview Questions (Quick Answers)

**Q: Walk through the architecture**
A: React SPA → Express API → MongoDB. Clerk for auth, S3 for files. Key: 2dsphere geospatial indexing.

**Q: How do you handle security?**
A: Multi-layer: Clerk auth, RBAC, Joi validation, rate limiting, Helmet, CORS, audit logs.

**Q: Most challenging part?**
A: Geospatial query optimization. Reduced 5s to <500ms with proper indexing.

**Q: How would you scale to 100K users?**
A: MongoDB sharding by campusId, Redis caching, serverless auto-scaling, CDN, read replicas.

**Q: Why MongoDB over PostgreSQL?**
A: Native geospatial support (2dsphere), flexible schema, horizontal scaling. (Could use PostgreSQL + PostGIS too)

**Q: How do you ensure data privacy?**
A: Anonymous reports hide reporterId from public API, store for audit, moderators can see.

---

## 💡 Key Technical Concepts to Know

1. **GeoJSON**: `{ type: "Point", coordinates: [lng, lat] }`
2. **2dsphere Index**: MongoDB geospatial index type
3. **$near Operator**: Finds documents near a point
4. **Signed URLs**: Time-limited S3 upload URLs
5. **JWT**: JSON Web Tokens for authentication
6. **RBAC**: Role-Based Access Control
7. **Webhook**: HTTP callback (Clerk → Backend)
8. **Serverless**: Functions that auto-scale

---

## 📝 Code Snippets to Remember

### Geospatial Query
```javascript
Report.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 1000
    }
  }
})
```

### RBAC Middleware
```javascript
export const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

### S3 Signed URL
```javascript
const uploadUrl = await s3.getSignedUrlPromise('putObject', {
  Bucket: BUCKET,
  Key: key,
  Expires: 300,
  ContentType: fileType
});
```

---

## 🎓 What This Project Demonstrates

✅ Full-stack development (MERN)
✅ Database design & optimization
✅ Geospatial data handling
✅ Authentication & authorization
✅ Security best practices
✅ API design (RESTful)
✅ Cloud services (AWS S3)
✅ Performance optimization
✅ Problem-solving skills
✅ Modern frontend (React 19)
✅ State management (Zustand)
✅ Real-time features (Socket.io)
✅ Deployment (Vercel serverless)

---

## 🚀 Future Enhancements (If Asked)

1. **Push Notifications**: Firebase Cloud Messaging
2. **Analytics Dashboard**: Heatmaps, trends, charts
3. **Real-Time Chat**: Socket.io for moderators
4. **ML Integration**: Auto-categorize reports, detect spam
5. **Mobile App**: React Native
6. **Public API**: Third-party integrations

---

## 📚 Resources to Mention

- MongoDB Geospatial Docs
- Clerk Authentication
- Leaflet Maps
- AWS S3 Documentation
- React Best Practices

---

## ✅ Pre-Interview Checklist

- [ ] Can explain architecture in 30 seconds
- [ ] Know geospatial indexing details
- [ ] Understand RBAC implementation
- [ ] Can discuss security measures
- [ ] Ready to explain biggest challenge
- [ ] Know all tech stack versions
- [ ] Can discuss scaling strategies
- [ ] Have GitHub repo link ready

---

## 🎤 Closing Statement

"This project taught me full-stack development, database optimization, and security best practices. The most valuable lesson was learning to optimize geospatial queries - it's not just about writing code, but understanding how databases work under the hood. I'm excited to bring these skills to your team."

---

**Print this page and keep it handy during your interview!** 📄
