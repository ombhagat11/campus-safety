import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, FilePlus, User, Shield, Users, BarChart2, LogOut, List } from "lucide-react";
import useAuthStore from "../../stores/authStore";

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const isActive = (path) => location.pathname.includes(path);

    const navItems = [
        { icon: Home, label: "Dashboard", path: "/app/dashboard", roles: ["student", "moderator", "admin"] },
        { icon: List, label: "Feed", path: "/app/feed", roles: ["student", "moderator", "admin"] },
        { icon: Map, label: "Campus Map", path: "/app/map", roles: ["student", "moderator", "admin"] },
        { icon: FilePlus, label: "Create Report", path: "/app/create-report", roles: ["student"] },
        { icon: User, label: "My Profile", path: "/app/profile", roles: ["student", "moderator", "admin"] },
    ];

    const moderatorItems = [
        { icon: Shield, label: "Mod Dashboard", path: "/app/moderator/dashboard", roles: ["moderator"] },
        { icon: FilePlus, label: "Report Queue", path: "/app/moderator/queue", roles: ["moderator"] },
    ];

    const adminItems = [
        { icon: BarChart2, label: "Admin Dashboard", path: "/app/admin/dashboard", roles: ["admin"] },
        { icon: Users, label: "User Management", path: "/app/admin/users", roles: ["admin"] },
    ];

    const filterItems = (items) => items.filter(item => item.roles.includes(user?.role || "student"));

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                    <Shield className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Campus<span className="text-primary-500">Safe</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto scrollbar-hide">
                {/* Main Menu */}
                <div className="space-y-1">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                    {filterItems(navItems).map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-primary-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Moderator Menu */}
                {user?.role === "moderator" && (
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Moderation</p>
                        {moderatorItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-purple-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Admin Menu */}
                {user?.role === "admin" && (
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin</p>
                        {adminItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-red-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
