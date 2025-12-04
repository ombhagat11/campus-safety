import React from "react";

const Badge = ({
    children,
    variant = "default",
    size = "md",
    className = "",
}) => {
    const variants = {
        default: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
        primary: "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800",
        success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
        danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
        purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
