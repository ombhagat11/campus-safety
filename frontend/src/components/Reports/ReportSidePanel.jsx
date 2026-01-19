import { X, MapPin, Clock, User, AlertTriangle, CheckCircle, XCircle, Shield, Info } from 'lucide-react';
import MapView from '../Map/MapView';
import Button from '../common/Button';
import Card from '../common/Card';

const ReportSidePanel = ({ report, onClose, onAction }) => {
    if (!report) return null;

    const getSeverityColor = (severity) => {
        const colors = {
            1: 'bg-green-100 text-green-800 border-green-200',
            2: 'bg-blue-100 text-blue-800 border-blue-200',
            3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            4: 'bg-orange-100 text-orange-800 border-orange-200',
            5: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[severity] || colors[3];
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            verified: 'bg-blue-100 text-blue-800 border-blue-200',
            resolved: 'bg-green-100 text-green-800 border-green-200',
            invalid: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || colors.pending;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="fixed inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md md:max-w-lg transform transition-transform duration-500 ease-in-out">
                    <div className="h-full flex flex-col bg-white shadow-2xl">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Report Details</h2>
                                <p className="text-sm text-slate-500">ID: {report._id?.substring(0, 8)}...</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Map Preview */}
                            <div className="h-64 w-full bg-slate-100 relative">
                                {report.location?.coordinates ? (
                                    <MapView
                                        reports={[report]}
                                        center={[report.location.coordinates[1], report.location.coordinates[0]]}
                                        onMarkerClick={() => { }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                        <MapPin className="w-12 h-12 mb-2 opacity-20" />
                                        <span>No location data available</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status & Severity Badges */}
                                <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityColor(report.severity)}`}>
                                        Level {report.severity}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{report.title}</h3>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {report.description}
                                    </p>
                                </div>

                                {/* Meta Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
                                        <User className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Reporter</p>
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {report.isAnonymous ? 'Anonymous' : (report.reporterId?.name || 'Student')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-indigo-500" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Time</p>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Category</p>
                                            <p className="text-sm font-semibold text-slate-900 capitalize">
                                                {report.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
                                        <Shield className="w-5 h-5 text-emerald-500" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Verified</p>
                                            <p className="text-sm font-semibold text-slate-900 capitalize">
                                                {report.status === 'pending' ? 'No' : 'Yes'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Resolution Information */}
                                {(report.status === 'resolved' || report.status === 'invalid' || report.status === 'rejected') && (
                                    <div className={`p-4 rounded-xl border ${report.status === 'resolved' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                                        }`}>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Info className={`w-5 h-5 ${report.status === 'resolved' ? 'text-emerald-600' : 'text-rose-600'
                                                }`} />
                                            <h4 className="font-bold text-slate-900">Resolution Information</h4>
                                        </div>
                                        <p className="text-sm text-slate-600 italic">
                                            {report.resolutionDetails || `This report has been marked as ${report.status} by the moderation team.`}
                                        </p>
                                        {report.resolvedAt && (
                                            <p className="text-xs text-slate-400 mt-2 text-right">
                                                Resolved on {new Date(report.resolvedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer - Actions */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center space-x-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => window.open(`/app/report/${report._id}`, '_blank')}
                            >
                                Open Full Page
                            </Button>
                            {report.status === 'pending' && (
                                <>
                                    <Button
                                        variant="success"
                                        className="flex-1"
                                        icon={<CheckCircle className="w-4 h-4" />}
                                        onClick={() => onAction(report._id, 'verify')}
                                    >
                                        Verify
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="flex-1"
                                        icon={<XCircle className="w-4 h-4" />}
                                        onClick={() => onAction(report._id, 'reject')}
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSidePanel;
