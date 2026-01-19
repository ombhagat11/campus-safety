import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import CreateReportPage from "./pages/CreateReportPage";
import ReportDetailsPage from "./pages/ReportDetailsPage";
import ReportsFeed from "./pages/ReportsFeed";
import ProfilePage from "./pages/ProfilePage";
import About from "./pages/About";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/layout/Layout";

import ModeratorDashboard from "./pages/moderator/Dashboard";
import ReportQueue from "./pages/moderator/ReportQueue";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminAnalytics from "./pages/admin/Analytics";
import UserManagement from "./pages/admin/Users";

import LandingPage from "./pages/public/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reports" element={<ReportsFeed />} />
        <Route path="map" element={<MapPage />} />
        <Route path="create-report" element={<CreateReportPage />} />
        <Route path="report/:id" element={<ReportDetailsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Moderator Routes */}
        <Route path="moderator/dashboard" element={<ModeratorDashboard />} />
        <Route path="moderator/queue" element={<ReportQueue />} />

        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/analytics" element={<AdminAnalytics />} />
        <Route path="admin/users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
