import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    loadingText, // Custom prop - don't pass to DOM
    helperText, // Custom prop - don't pass to DOM
    className = "",
    disabled,
    type = "button",
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-press";

    const variants = {
        primary: "bg-gradient-primary text-white hover:shadow-lg hover:shadow-primary-500/30 focus:ring-primary-500 border border-transparent",
        secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-200",
        ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-200",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-red-500/30",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow-emerald-500/30",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2",
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading && loadingText ? loadingText : children}
        </button>
    );
};

export default Button;
