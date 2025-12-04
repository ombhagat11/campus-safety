import React from "react";

const Card = ({
    children,
    className = "",
    hover = false,
    glass = false,
    onClick,
    ...props
}) => {
    const baseStyles = "rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300";
    const bgStyles = glass
        ? "glass dark:glass-dark"
        : "bg-white dark:bg-slate-800 shadow-sm";
    const hoverStyles = hover ? "card-hover cursor-pointer" : "";

    return (
        <div
            className={`${baseStyles} ${bgStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
