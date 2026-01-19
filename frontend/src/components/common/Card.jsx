// Modern Card Component
const Card = ({
    children,
    title,
    subtitle,
    icon,
    action,
    hover = false,
    gradient = false,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    ...rest
}) => {
    const hoverClass = hover ? 'card-hover' : '';
    const gradientClass = gradient ? 'bg-gradient-to-br from-white to-blue-50' : 'bg-white';

    return (
        <div
            className={`${gradientClass} rounded-xl shadow-lg border border-slate-200 overflow-hidden ${hoverClass} ${className}`}
            {...rest}
        >
            {(title || icon || action) && (
                <div className={`px-6 py-4 border-b border-slate-200 flex items-center justify-between ${headerClassName}`}>
                    <div className="flex items-center space-x-3">
                        {icon && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                {icon}
                            </div>
                        )}
                        <div>
                            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
                            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={`px-6 py-4 ${bodyClassName}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;
