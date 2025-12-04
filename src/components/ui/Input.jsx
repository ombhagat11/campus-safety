import React, { forwardRef } from "react";

const Input = forwardRef(({
    label,
    error,
    className = "",
    containerClassName = "",
    type = "text",
    ...props
}, ref) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    type={type}
                    className={`
                        w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/50 
                        border border-slate-200 dark:border-slate-700 
                        text-slate-900 dark:text-white placeholder-slate-400 
                        focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                        disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500
                        transition-all duration-200
                        ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
