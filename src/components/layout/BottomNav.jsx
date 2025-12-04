import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, PlusCircle, User, List } from "lucide-react";

const BottomNav = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname.includes(path);

    const navItems = [
        { icon: Home, label: "Home", path: "/app/dashboard" },
        { icon: List, label: "Feed", path: "/app/feed" },
        { icon: Map, label: "Map", path: "/app/map" },
        { icon: PlusCircle, label: "Report", path: "/app/create-report", isPrimary: true },
        { icon: User, label: "Profile", path: "/app/profile" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${item.isPrimary ? "-mt-6" : ""
                            }`}
                    >
                        {item.isPrimary ? (
                            <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/40 btn-press">
                                <item.icon className="w-7 h-7 text-white" />
                            </div>
                        ) : (
                            <>
                                <item.icon
                                    className={`w-6 h-6 transition-colors duration-200 ${isActive(item.path)
                                        ? "text-primary-600 dark:text-primary-400"
                                        : "text-slate-400 dark:text-slate-500"
                                        }`}
                                />
                                <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive(item.path)
                                    ? "text-primary-600 dark:text-primary-400"
                                    : "text-slate-400 dark:text-slate-500"
                                    }`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
