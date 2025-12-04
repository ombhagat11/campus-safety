import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./stores/authStore";
import apiClient from "./services/apiClient";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import About from "./pages/About";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Layout
import Layout from "./components/layout/Layout";

// Student Pages
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import FeedPage from "./pages/FeedPage";
import CreateReportPage from "./pages/CreateReportPage";
import ReportDetailsPage from "./pages/ReportDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import MyReportsPage from "./pages/MyReportsPage";

// Moderator Pages
import ModeratorDashboard from "./pages/moderator/Dashboard";
import ReportQueue from "./pages/moderator/ReportQueue";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAnalytics from "./pages/admin/Analytics";
import UserManagement from "./pages/admin/Users";

function App() {
  const { isAuthenticated, setAuth, logout } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (token && isAuthenticated) {
        try {
          // Verify token and get user data
          const response = await apiClient.get("/auth/me");
          if (response.data.success) {
            setAuth({
              user: response.data.data.user,
              accessToken: token,
              refreshToken: localStorage.getItem("refresh_token"),
            });
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          // Token invalid, logout
          logout();
        }
      }
    };

    initAuth();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />

      {/* Guest Routes (Auth Pages) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

      {/* Protected Routes - All Authenticated Users */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Student Routes */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="create-report" element={<CreateReportPage />} />
        <Route path="report/:id" element={<ReportDetailsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="my-reports" element={<MyReportsPage />} />

        {/* Moderator Routes - Requires moderator, admin, or super-admin role */}
        <Route
          path="moderator/dashboard"
          element={
            <ProtectedRoute requiredRoles={["moderator", "admin", "super-admin"]}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="moderator/queue"
          element={
            <ProtectedRoute requiredRoles={["moderator", "admin", "super-admin"]}>
              <ReportQueue />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Requires admin or super-admin role */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute requiredRoles={["admin", "super-admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <ProtectedRoute requiredRoles={["admin", "super-admin"]}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute requiredRoles={["admin", "super-admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 - Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
