// Modern Stat Card Component
const StatCard = ({
    title,
    value,
    change,
    changeType = 'positive',
    icon,
    color = 'blue',
    trend
}) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        amber: 'from-amber-500 to-amber-600',
        indigo: 'from-indigo-500 to-indigo-600',
        purple: 'from-purple-500 to-purple-600'
    };

    const changeColors = {
        positive: 'text-green-600 bg-green-50',
        negative: 'text-red-600 bg-red-50',
        neutral: 'text-slate-600 bg-slate-50'
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 card-hover">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                    {change && (
                        <div className="mt-2 flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
                                {changeType === 'positive' && '↑'}
                                {changeType === 'negative' && '↓'}
                                {changeType === 'neutral' && '→'}
                                {change}
                            </span>
                            {trend && <span className="text-xs text-slate-500">{trend}</span>}
                        </div>
                    )}
                </div>
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
