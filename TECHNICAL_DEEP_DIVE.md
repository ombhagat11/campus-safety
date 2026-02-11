# Campus Safety - Technical Deep Dive

## 📘 Advanced Technical Interview Preparation

This document covers advanced technical concepts and implementation details for senior-level interviews.

---

## 🗄️ Database Architecture & Optimization

### MongoDB Geospatial Indexing Deep Dive

#### What is a 2dsphere Index?

A 2dsphere index supports queries that calculate geometries on an earth-like sphere. It's specifically designed for:
- GeoJSON objects
- Legacy coordinate pairs (longitude, latitude)
- Spherical geometry calculations

**Index Creation**:
```javascript
// In Report model
reportSchema.index({ location: '2dsphere' });

// Compound index for campus-scoped queries
reportSchema.index({ campusId: 1, location: '2dsphere' });

// Compound index for filtered queries
reportSchema.index({ 
  campusId: 1, 
  status: 1, 
  location: '2dsphere' 
});
```

#### Query Performance Analysis

**Without Index**:
```javascript
// Collection scan: O(n)
// Time: 5000ms for 10,000 documents
db.reports.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [-122.4194, 37.7749] },
      $maxDistance: 1000
    }
  }
})
```

**With 2dsphere Index**:
```javascript
// Index scan: O(log n)
// Time: 450ms for 10,000 documents
// Same query, but uses index
```

**Explain Plan**:
```javascript
db.reports.find({...}).explain("executionStats")

// Output:
{
  executionStats: {
    executionTimeMillis: 450,
    totalDocsExamined: 127,
    totalKeysExamined: 127,
    executionStages: {
      stage: "GEO_NEAR_2DSPHERE",
      indexName: "location_2dsphere"
    }
  }
}
```

#### Coordinate System Considerations

**Important**: GeoJSON uses [longitude, latitude] order (x, y), NOT [latitude, longitude]!

```javascript
// CORRECT
location: {
  type: "Point",
  coordinates: [-122.4194, 37.7749] // [lng, lat]
}

// WRONG (will cause incorrect results)
location: {
  type: "Point",
  coordinates: [37.7749, -122.4194] // [lat, lng] - WRONG!
}
```

**Why?** GeoJSON follows the [x, y] convention from mathematics, where x = longitude (east-west) and y = latitude (north-south).

---

### Query Optimization Strategies

#### 1. Compound Index Strategy

```javascript
// Query pattern: Find reports by campus, status, and location
db.reports.find({
  campusId: ObjectId("..."),
  status: { $in: ["verified", "pending"] },
  location: { $near: {...} }
})

// Optimal index: campusId → status → location
reportSchema.index({ 
  campusId: 1, 
  status: 1, 
  location: '2dsphere' 
});
```

**Index Prefix Rule**: MongoDB can use a compound index for queries that match a prefix of the index keys.

```javascript
// This index: { campusId: 1, status: 1, location: '2dsphere' }
// Can be used for:
✅ { campusId: X }
✅ { campusId: X, status: Y }
✅ { campusId: X, status: Y, location: $near }
❌ { status: Y } // Doesn't match prefix
❌ { location: $near } // Doesn't match prefix
```

#### 2. Projection Optimization

```javascript
// BAD: Fetches all fields (including large arrays)
const reports = await Report.find({ campusId });

// GOOD: Only fetch needed fields
const reports = await Report
  .find({ campusId })
  .select('title category severity location createdAt status')
  .lean(); // Returns plain JS objects (faster)
```

**Performance Impact**:
- Without projection: 250ms, 2.5MB transferred
- With projection: 120ms, 500KB transferred

#### 3. Pagination Strategy

```javascript
// BAD: Skip is slow for large offsets
const reports = await Report
  .find({ campusId })
  .skip(1000) // Scans and discards 1000 docs
  .limit(20);

// BETTER: Cursor-based pagination
const reports = await Report
  .find({ 
    campusId,
    _id: { $gt: lastSeenId } // Continue from last seen
  })
  .limit(20)
  .sort({ _id: 1 });
```

**Why?** Skip requires MongoDB to scan and discard documents, while cursor-based pagination uses the index directly.

---

### Aggregation Pipeline for Analytics

```javascript
// Get incident statistics by category
const stats = await Report.aggregate([
  // Stage 1: Match campus
  { $match: { campusId: ObjectId(campusId) } },
  
  // Stage 2: Group by category
  { $group: {
    _id: '$category',
    count: { $sum: 1 },
    avgSeverity: { $avg: '$severity' },
    recentIncidents: { 
      $push: {
        title: '$title',
        createdAt: '$createdAt'
      }
    }
  }},
  
  // Stage 3: Sort by count
  { $sort: { count: -1 } },
  
  // Stage 4: Limit to top 10
  { $limit: 10 }
]);

// Result:
[
  { _id: 'theft', count: 45, avgSeverity: 3.2, recentIncidents: [...] },
  { _id: 'assault', count: 23, avgSeverity: 4.5, recentIncidents: [...] },
  ...
]
```

---

## 🔐 Authentication & Security Deep Dive

### Clerk Authentication Flow

#### 1. User Registration Flow

```
User → Clerk Sign-Up UI → Clerk Server → Webhook → Backend → MongoDB

Detailed Steps:
1. User fills form with email, password, campus code
2. Frontend calls Clerk.signUp({ unsafeMetadata: { campusCode } })
3. Clerk creates user account
4. Clerk sends user.created webhook to backend
5. Backend validates campus code
6. Backend creates user in MongoDB
7. If invalid, backend deletes Clerk user
8. Clerk sends verification email
9. User clicks link
10. Clerk marks user as verified
11. Clerk sends user.updated webhook
12. Backend updates isVerified in MongoDB
```

#### 2. Token Verification Process

```javascript
// Frontend: Get token from Clerk
import { useAuth } from '@clerk/clerk-react';

function MyComponent() {
  const { getToken } = useAuth();
  
  const fetchData = async () => {
    const token = await getToken();
    const response = await axios.get('/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
}
```

```javascript
// Backend: Verify token
import { clerkClient } from '@clerk/clerk-sdk-node';

export const requireAuth = async (req, res, next) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token with Clerk
    const session = await clerkClient.sessions.verifySession(
      req.headers['clerk-session-id'],
      token
    );
    
    // Get user from MongoDB
    const user = await User.findOne({ clerkId: session.userId });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Attach user to request
    req.user = user;
    req.auth = session;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 3. Webhook Security

```javascript
import { Webhook } from 'svix';

export const verifyWebhook = (req, res, next) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  // Get headers
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];
  
  // Verify signature
  const wh = new Webhook(WEBHOOK_SECRET);
  
  try {
    const payload = wh.verify(
      JSON.stringify(req.body),
      {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature
      }
    );
    
    req.webhookPayload = payload;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
};
```

**Why Webhook Verification?**
- Prevents malicious actors from sending fake webhooks
- Ensures data integrity
- Validates request origin

---

### Role-Based Access Control (RBAC) Implementation

#### Permission Matrix

| Resource | Student | Moderator | Admin |
|----------|---------|-----------|-------|
| Create Report | ✅ | ✅ | ✅ |
| Edit Own Report | ✅ (30min) | ✅ | ✅ |
| Delete Own Report | ✅ | ✅ | ✅ |
| View Reports | ✅ (campus) | ✅ (campus) | ✅ (all) |
| Verify Report | ❌ | ✅ | ✅ |
| Ban User | ❌ | ✅ | ✅ |
| Create Campus | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

#### Advanced RBAC Middleware

```javascript
// Permission definitions
const permissions = {
  'report:create': ['student', 'moderator', 'admin'],
  'report:edit:own': ['student', 'moderator', 'admin'],
  'report:edit:any': ['moderator', 'admin'],
  'report:delete:own': ['student', 'moderator', 'admin'],
  'report:delete:any': ['moderator', 'admin'],
  'report:verify': ['moderator', 'admin'],
  'user:ban': ['moderator', 'admin'],
  'campus:create': ['admin'],
  'campus:edit': ['admin']
};

// Check permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const allowedRoles = permissions[permission];
    
    if (!allowedRoles || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: userRole
      });
    }
    
    next();
  };
};

// Usage
router.patch(
  '/reports/:id',
  requireAuth,
  requirePermission('report:edit:any'),
  updateReport
);
```

#### Resource Ownership Validation

```javascript
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      let resource;
      
      switch (resourceType) {
        case 'report':
          resource = await Report.findById(resourceId);
          break;
        case 'comment':
          resource = await Comment.findById(resourceId);
          break;
        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      // Check ownership or moderator/admin role
      const isOwner = resource.userId?.toString() === req.user._id.toString();
      const isModerator = ['moderator', 'admin'].includes(req.user.role);
      
      if (!isOwner && !isModerator) {
        return res.status(403).json({ error: 'Not authorized to modify this resource' });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  };
};

// Usage
router.patch(
  '/reports/:id',
  requireAuth,
  requireOwnership('report'),
  updateReport
);
```

---

## 🌐 Real-Time Communication with Socket.io

### Architecture

```
Client 1 (Campus A) ──┐
Client 2 (Campus A) ──┼──→ Socket.io Server ──→ MongoDB
Client 3 (Campus B) ──┘         ↓
                            Room: campus-A
                            Room: campus-B
```

### Implementation

#### Server Setup

```javascript
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    // Verify token with Clerk
    const session = await clerkClient.sessions.verifySession(
      socket.handshake.auth.sessionId,
      token
    );
    
    // Get user from MongoDB
    const user = await User.findOne({ clerkId: session.userId });
    
    if (!user) {
      return next(new Error('Authentication error'));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.email}`);
  
  // Join campus room
  const campusRoom = `campus-${socket.user.campusId}`;
  socket.join(campusRoom);
  
  console.log(`User joined room: ${campusRoom}`);
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.email}`);
  });
});

// Emit new report to campus
export const emitNewReport = (report) => {
  io.to(`campus-${report.campusId}`).emit('newReport', {
    report,
    timestamp: new Date()
  });
};

// Emit report update
export const emitReportUpdate = (report) => {
  io.to(`campus-${report.campusId}`).emit('reportUpdated', {
    reportId: report._id,
    status: report.status,
    timestamp: new Date()
  });
};
```

#### Client Setup

```javascript
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';

function useSocket() {
  const { getToken, sessionId } = useAuth();
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    const initSocket = async () => {
      const token = await getToken();
      
      const newSocket = io(process.env.VITE_API_URL, {
        auth: {
          token,
          sessionId
        }
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to Socket.io');
      });
      
      newSocket.on('newReport', (data) => {
        console.log('New report:', data.report);
        // Update state
        setReports(prev => [data.report, ...prev]);
        
        // Show notification
        toast.success(`New ${data.report.category} report nearby`);
      });
      
      newSocket.on('reportUpdated', (data) => {
        console.log('Report updated:', data);
        // Update specific report in state
        setReports(prev => prev.map(r => 
          r._id === data.reportId 
            ? { ...r, status: data.status }
            : r
        ));
      });
      
      setSocket(newSocket);
    };
    
    initSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  
  return socket;
}
```

### Scaling Socket.io

**Problem**: Socket.io stores connections in memory. With multiple servers, users on different servers can't communicate.

**Solution**: Redis Adapter

```javascript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

**How it works**:
1. Server A emits event to room "campus-123"
2. Event published to Redis
3. All servers (A, B, C) subscribed to Redis receive event
4. Each server emits to its local clients in "campus-123"

---

## 📁 File Upload Architecture

### Two-Step Upload Process

#### Step 1: Generate Signed URL

```javascript
// Backend: /api/uploads/signed-url
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const getSignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Generate unique key
    const key = `reports/${req.user.campusId}/${uuidv4()}-${fileName}`;
    
    // Generate signed URL
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 300, // 5 minutes
      ContentType: fileType,
      ACL: 'public-read'
    };
    
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    res.json({ uploadUrl, fileUrl, key });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
};
```

#### Step 2: Upload from Frontend

```javascript
// Frontend: Upload component
import { useState } from 'react';
import axios from 'axios';

function ImageUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB');
      return;
    }
    
    try {
      setUploading(true);
      
      // Step 1: Get signed URL from backend
      const { data } = await axios.post('/api/uploads/signed-url', {
        fileName: file.name,
        fileType: file.type
      });
      
      // Step 2: Upload directly to S3
      await axios.put(data.uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        }
      });
      
      // Step 3: Return file URL to parent
      onUploadComplete(data.fileUrl);
      
      setUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

### Security Considerations

#### 1. Signed URL Expiration

```javascript
// URLs expire after 5 minutes
Expires: 300

// Why? Prevents:
// - Unauthorized uploads after user session ends
// - URL sharing for malicious uploads
// - Replay attacks
```

#### 2. File Type Validation

```javascript
// Backend validation
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(fileType)) {
  return res.status(400).json({ error: 'Invalid file type' });
}

// Frontend validation
<input type="file" accept="image/jpeg,image/png,image/webp" />
```

#### 3. File Size Limits

```javascript
// Frontend check
if (file.size > 5 * 1024 * 1024) {
  alert('File too large');
  return;
}

// S3 bucket policy
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:PutObject",
    "Resource": "arn:aws:s3:::campus-safety/*",
    "Condition": {
      "NumericGreaterThan": {
        "s3:content-length": 5242880
      }
    }
  }]
}
```

#### 4. Virus Scanning (Planned)

```javascript
// AWS Lambda function triggered on S3 upload
export const scanFile = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  
  // Download file
  const file = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  
  // Scan with ClamAV
  const result = await clamav.scan(file.Body);
  
  if (result.isInfected) {
    // Delete infected file
    await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    
    // Notify user
    await sendEmail({
      to: getUserEmail(key),
      subject: 'File upload rejected',
      body: 'Your file was rejected due to security concerns.'
    });
  }
};
```

---

## 🚀 Performance Optimization Techniques

### 1. Database Query Optimization

#### N+1 Query Problem

```javascript
// BAD: N+1 queries
const reports = await Report.find({ campusId });
for (const report of reports) {
  report.reporter = await User.findById(report.reporterId); // N queries
}

// GOOD: Use populate
const reports = await Report
  .find({ campusId })
  .populate('reporterId', 'name email profileImage'); // 1 query
```

#### Aggregation vs Multiple Queries

```javascript
// BAD: Multiple queries
const totalReports = await Report.countDocuments({ campusId });
const verifiedReports = await Report.countDocuments({ campusId, status: 'verified' });
const pendingReports = await Report.countDocuments({ campusId, status: 'pending' });

// GOOD: Single aggregation
const stats = await Report.aggregate([
  { $match: { campusId: ObjectId(campusId) } },
  { $group: {
    _id: '$status',
    count: { $sum: 1 }
  }}
]);
// Result: [{ _id: 'verified', count: 45 }, { _id: 'pending', count: 12 }]
```

### 2. Frontend Optimization

#### Code Splitting

```javascript
// Lazy load routes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ModeratorPanel = lazy(() => import('./pages/ModeratorPanel'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/moderator" element={<ModeratorPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

**Impact**: Initial bundle size reduced from 500KB to 150KB.

#### Memoization

```javascript
import { memo, useMemo } from 'react';

// Memoize expensive component
const ReportCard = memo(({ report }) => {
  return (
    <div>
      <h3>{report.title}</h3>
      <p>{report.description}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if report ID changes
  return prevProps.report._id === nextProps.report._id;
});

// Memoize expensive calculation
function ReportList({ reports, filters }) {
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (filters.category !== 'all' && r.category !== filters.category) {
        return false;
      }
      if (filters.severity && r.severity < filters.severity) {
        return false;
      }
      return true;
    });
  }, [reports, filters]); // Only recalculate when these change
  
  return (
    <div>
      {filteredReports.map(r => <ReportCard key={r._id} report={r} />)}
    </div>
  );
}
```

#### Virtual Scrolling

```javascript
import { FixedSizeList } from 'react-window';

function ReportList({ reports }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ReportCard report={reports[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={reports.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**Impact**: Rendering 1000 reports:
- Without virtualization: 5000ms, 60% CPU
- With virtualization: 200ms, 15% CPU

### 3. API Response Optimization

#### Compression

```javascript
import compression from 'compression';

app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress images
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

**Impact**: 
- JSON response: 250KB → 45KB (82% reduction)
- Transfer time: 500ms → 90ms

#### Caching with Redis

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache middleware
export const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      // Check cache
      const cached = await redis.get(key);
      
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json
      res.json = (data) => {
        // Cache response
        redis.setex(key, duration, JSON.stringify(data));
        
        // Send response
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Usage
router.get(
  '/reports/nearby',
  requireAuth,
  cacheMiddleware(300), // Cache for 5 minutes
  getNearbyReports
);
```

---

## 🧪 Testing Strategies

### Unit Testing

```javascript
// utils/validation.test.js
import { validateCoordinates } from './validation';

describe('validateCoordinates', () => {
  it('should accept valid coordinates', () => {
    expect(validateCoordinates(-122.4194, 37.7749)).toBe(true);
  });
  
  it('should reject invalid longitude', () => {
    expect(validateCoordinates(200, 37.7749)).toBe(false);
  });
  
  it('should reject invalid latitude', () => {
    expect(validateCoordinates(-122.4194, 100)).toBe(false);
  });
});
```

### Integration Testing

```javascript
// tests/reports.test.js
import request from 'supertest';
import app from '../app';
import { setupTestDB, teardownTestDB } from './helpers';

describe('Reports API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });
  
  afterAll(async () => {
    await teardownTestDB();
  });
  
  describe('POST /api/reports', () => {
    it('should create a report with valid data', async () => {
      const token = await getTestToken('student');
      
      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test incident',
          description: 'This is a test',
          category: 'theft',
          severity: 3,
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          }
        });
      
      expect(response.status).toBe(201);
      expect(response.body.report.title).toBe('Test incident');
    });
    
    it('should reject report without authentication', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({
          title: 'Test incident',
          description: 'This is a test',
          category: 'theft',
          severity: 3,
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          }
        });
      
      expect(response.status).toBe(401);
    });
  });
});
```

### E2E Testing

```javascript
// cypress/e2e/report-creation.cy.js
describe('Report Creation Flow', () => {
  beforeEach(() => {
    cy.login('student@example.com', 'password');
  });
  
  it('should create a new report', () => {
    // Navigate to create report page
    cy.visit('/reports/create');
    
    // Fill form
    cy.get('[data-testid="title-input"]').type('Bike theft');
    cy.get('[data-testid="description-input"]').type('My bike was stolen');
    cy.get('[data-testid="category-select"]').select('theft');
    cy.get('[data-testid="severity-slider"]').invoke('val', 3).trigger('input');
    
    // Set location
    cy.get('[data-testid="map"]').click(200, 200);
    
    // Upload image
    cy.get('[data-testid="image-upload"]').attachFile('bike.jpg');
    
    // Submit
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify success
    cy.url().should('include', '/reports/');
    cy.contains('Report created successfully');
  });
});
```

---

## 📊 Monitoring & Observability

### Application Performance Monitoring

```javascript
// Sentry integration
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Error tracking
app.use(Sentry.Handlers.errorHandler());

// Custom error tracking
try {
  await Report.create(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'report-creation'
    },
    extra: {
      reportData: data,
      userId: req.user._id
    }
  });
  throw error;
}
```

### Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('Report created', {
  reportId: report._id,
  userId: req.user._id,
  campusId: req.user.campusId
});

logger.error('Failed to create report', {
  error: error.message,
  stack: error.stack,
  userId: req.user._id
});
```

---

## 🎓 Key Takeaways

1. **Geospatial Indexing**: 2dsphere indexes are crucial for location-based queries
2. **Authentication**: Managed services (Clerk) reduce complexity and improve security
3. **RBAC**: Multi-layer permission checking prevents unauthorized access
4. **Performance**: Proper indexing, caching, and optimization are essential
5. **Real-Time**: Socket.io enables real-time features but requires careful scaling
6. **Security**: Defense in depth with multiple security layers
7. **Testing**: Comprehensive testing strategy ensures reliability
8. **Monitoring**: Observability is crucial for production systems

---

This deep dive should prepare you for advanced technical discussions in senior-level interviews!
