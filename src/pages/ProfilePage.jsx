import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Lock, Bell, Camera, Mail, Building, Shield, Save } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const ProfilePage = () => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.patch(`/users/${user._id}`, profileData);
            setUser(response.data.data);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        try {
            setLoading(true);
            await axios.post(`/users/${user._id}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success("Password changed successfully!");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile Info", icon: User },
        { id: "password", label: "Security", icon: Lock },
        { id: "preferences", label: "Preferences", icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile & Settings</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your account settings and preferences</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <Card className="md:w-64 h-fit p-2">
                        <div className="flex md:flex-col overflow-x-auto md:overflow-visible no-scrollbar gap-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-primary-500" : "text-slate-400"}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Content Area */}
                    <div className="flex-1">
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <Card className="p-6 md:p-8 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Information</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <button
                                                type="button"
                                                className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{user?.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Full Name"
                                            icon={User}
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                        <Input
                                            label="Email Address"
                                            icon={Mail}
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="opacity-70 cursor-not-allowed"
                                        />
                                        <Input
                                            label="Campus"
                                            icon={Building}
                                            value={user?.campusId?.name || ""}
                                            disabled
                                            className="opacity-70 cursor-not-allowed"
                                        />
                                        <Input
                                            label="Role"
                                            icon={Shield}
                                            value={user?.role || ""}
                                            disabled
                                            className="opacity-70 cursor-not-allowed capitalize"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                                        <Button
                                            type="submit"
                                            isLoading={loading}
                                            disabled={loading}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* Password Tab */}
                        {activeTab === "password" && (
                            <Card className="p-6 md:p-8 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        icon={Lock}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        icon={Lock}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        minLength={8}
                                        helperText="Must be at least 8 characters"
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        icon={Lock}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                    />

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                                        <Button
                                            type="submit"
                                            isLoading={loading}
                                            disabled={loading}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === "preferences" && (
                            <Card className="p-6 md:p-8 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
                                <div className="space-y-6">
                                    {[
                                        { title: "Email Notifications", desc: "Receive email updates about new reports", default: true },
                                        { title: "Push Notifications", desc: "Get push notifications for nearby incidents", default: true },
                                        { title: "SMS Notifications", desc: "Receive text messages for critical alerts", default: false },
                                    ].map((pref, index) => (
                                        <div key={index} className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{pref.title}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{pref.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={pref.default} />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
