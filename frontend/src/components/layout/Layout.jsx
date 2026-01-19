import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
    Home,
    MapPin,
    Plus,
    User,
    Shield,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    AlertTriangle,
    Users,
    BarChart3
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Navigation items based on role
    const getNavItems = () => {
        const baseItems = [
            { name: 'Dashboard', path: '/app/dashboard', icon: Home },
            { name: 'Reports Feed', path: '/app/reports', icon: AlertTriangle },
            { name: 'Map View', path: '/app/map', icon: MapPin },
            { name: 'Create Report', path: '/app/create-report', icon: Plus },
            { name: 'Profile', path: '/app/profile', icon: User },
        ];

        if (user?.role === 'moderator' || user?.role === 'admin') {
            baseItems.push(
                { name: 'Moderator Panel', path: '/app/moderator/dashboard', icon: Shield },
                { name: 'Report Queue', path: '/app/moderator/queue', icon: AlertTriangle }
            );
        }

        if (user?.role === 'admin') {
            baseItems.push(
                { name: 'Admin Dashboard', path: '/app/admin/dashboard', icon: Settings },
                { name: 'Analytics', path: '/app/admin/analytics', icon: BarChart3 },
                { name: 'User Management', path: '/app/admin/users', icon: Users }
            );
        }

        return baseItems;
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-slate-200 fixed w-full top-0 z-50 shadow-sm">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <div className="flex items-center ml-4 lg:ml-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                    CS
                                </div>
                                <span className="ml-3 text-xl font-bold text-gradient">Campus Safety</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="hidden md:block relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <Bell className="w-5 h-5 text-slate-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User Menu */}
                            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 
                    transform transition-transform duration-300 ease-in-out z-40
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="h-full flex flex-col">
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            setSidebarOpen(false);
                                        }}
                                        className={`
                                            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                                            ${active
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Logout Button */}
                        <div className="p-4 border-t border-slate-200">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
