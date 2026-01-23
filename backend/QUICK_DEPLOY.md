# 🚀 QUICK DEPLOY REFERENCE

## ⚡ **3-Step Deployment**

### **1️⃣ Add MongoDB to Vercel**
```
vercel.com/dashboard → Your Project → Settings → Environment Variables
Add: MONGODB_URI = mongodb+srv://tukeshkumar1703_db_user:mcHuw3PreKvOP7sh@cluster0.inhnu8h.mongodb.net/?appName=Cluster0
```

### **2️⃣ Redeploy**
```
Deployments tab → Latest deployment → ••• → Redeploy
```

### **3️⃣ Test**
```bash
curl https://campus-safety-backend.vercel.app/health
```

---

## 📋 **Environment Variables**

### **Required:**
- `MONGODB_URI` - Your MongoDB connection string

### **Recommended:**
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend.vercel.app`

### **Optional:**
- `AWS_ACCESS_KEY_ID=dummy-key`
- `AWS_SECRET_ACCESS_KEY=dummy-secret`

### **Not Needed:**
- ~~CLERK_SECRET_KEY~~ (optional)
- ~~CLERK_PUBLISHABLE_KEY~~ (optional)

---

## ✅ **What's Ready**

- ✅ Serverless function: `api/index.js`
- ✅ Vercel config: `vercel.json`
- ✅ Clerk removed from requirements
- ✅ Local dev server running
- ✅ All documentation created

---

## 🧪 **Test Endpoints**

```bash
# Health
https://campus-safety-backend.vercel.app/health

# Root
https://campus-safety-backend.vercel.app/

# API
https://campus-safety-backend.vercel.app/api/public/reports
```

---

## 📖 **Documentation**

- **`README_FINAL_DEPLOYMENT.md`** - Complete guide
- **`CLERK_REMOVED_DEPLOY_NOW.md`** - Main deployment
- **`DEPLOY_WITHOUT_CLERK.md`** - Simplified
- **`VERCEL_SERVERLESS.md`** - Technical details

---

## 🆘 **Common Issues**

**"Missing MONGODB_URI"**
→ Add it in Vercel dashboard

**"Database connection failed"**
→ Whitelist 0.0.0.0/0 in MongoDB Atlas

**"Function timeout"**
→ Increase maxDuration in vercel.json

---

## 🎯 **Success Checklist**

- [ ] MongoDB URI added to Vercel
- [ ] Deployment shows "Ready"
- [ ] /health returns 200 OK
- [ ] No errors in Function Logs
- [ ] Frontend updated with backend URL

---

**🎊 Deploy in 2 minutes! Just add MongoDB URI!**
