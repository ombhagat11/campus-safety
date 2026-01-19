# 🔧 Temporary Bypass - Use Legacy Auth (Optional)

If you want to test the app WITHOUT setting up Clerk right now, you can temporarily revert to the old authentication system.

## Quick Bypass Steps

### 1. Update App.jsx

Change the imports back to the old auth pages:

```javascript
// In frontend/src/App.jsx
// Change these lines:
import ClerkSignIn from "./pages/ClerkSignIn";
import ClerkSignUp from "./pages/ClerkSignUp";

// Back to:
import Login from "./pages/Login";
import Register from "./pages/Register";
```

And update the routes:

```javascript
// Change:
<Route path="/login" element={<ClerkSignIn />} />
<Route path="/register" element={<ClerkSignUp />} />

// Back to:
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
```

### 2. Update main.jsx

Remove the ClerkProvider:

```javascript
// In frontend/src/main.jsx
// Change from:
import { ClerkProvider } from "@clerk/clerk-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);

// Back to:
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### 3. Update ProtectedRoute.jsx

Use the old auth store:

```javascript
// In frontend/src/components/ProtectedRoute.jsx
// Change from:
import { useAuth } from "@clerk/clerk-react";

const ProtectedRoute = ({ children }) => {
    const { isSignedIn, isLoaded } = useAuth();
    // ...
};

// Back to:
import useAuthStore from "../stores/authStore";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
```

## ⚠️ Important Notes

This is **TEMPORARY** and **NOT RECOMMENDED** for production because:
- You lose all Clerk benefits (OAuth, 2FA, etc.)
- You're using the old JWT system
- No automatic email verification
- Manual password management

## Better Approach

**Just get a Clerk key!** It takes 5 minutes:
1. Go to https://clerk.com
2. Sign up (free)
3. Create app
4. Copy key
5. Paste in `.env`

See `IMMEDIATE_FIX.md` for detailed instructions.

---

**Use this bypass only if you need to test something urgently and will set up Clerk properly later!**
