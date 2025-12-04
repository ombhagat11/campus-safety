import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Filter, Plus, Map as MapIcon, Layers, Navigation } from "lucide-react";
import MapView from "../components/Map/MapView";
import { getNearbyReports, getAllReports } from "../services/reportsService";
import { getCurrentLocation } from "../utils/helpers";
import { useRealtimeReports } from "../hooks/useSocket";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";

const CATEGORIES = [
    { id: "theft", label: "Theft", icon: "💰" },
    { id: "assault", label: "Assault", icon: "⚠️" },
    { id: "harassment", label: "Harassment", icon: "🚫" },
    { id: "vandalism", label: "Vandalism", icon: "🔨" },
    { id: "suspicious_activity", label: "Suspicious", icon: "👁️" },
    { id: "emergency", label: "Emergency", icon: "🚨" },
    { id: "fire", label: "Fire", icon: "🔥" },
    { id: "medical", label: "Medical", icon: "🏥" },
    { id: "hazard", label: "Hazard", icon: "⚡" },
    { id: "other", label: "Other", icon: "📌" },
];

const MapPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: [],
        severity: [1, 2, 3, 4, 5],
        radius: 1000,
    });

    // Fetch reports when location or filters change
    const fetchReports = useCallback(async (location) => {
        if (!location) return;

        try {
            setLoading(true);
            const data = await getNearbyReports(
                location.latitude,
                location.longitude,
                filters.radius,
                {
                    category: filters.category.length > 0 ? filters.category : undefined,
                }
            );
            setReports(data.data.reports);
            // Cache reports for offline use
            localStorage.setItem("cachedReports", JSON.stringify(data.data.reports));
        } catch (error) {
            console.error("Error fetching reports:", error);
            // Fallback to cached reports if fetch fails
            const cachedReports = localStorage.getItem("cachedReports");
            if (cachedReports) {
                try {
                    setReports(JSON.parse(cachedReports));
                    toast("Using cached reports (Offline mode)", { icon: "📡" });
                } catch (e) {
                    console.error("Error parsing cached reports", e);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Fetch default reports if location fails
    const fetchDefaultReports = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllReports(1, 50); // Fetch recent 50 reports
            setReports(data.data.reports);
        } catch (error) {
            console.error("Error fetching default reports:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get user location on mount
    useEffect(() => {
        // Try to get cached location first
        const cachedLocation = localStorage.getItem("userLocation");
        if (cachedLocation) {
            try {
                const parsed = JSON.parse(cachedLocation);
                setUserLocation(parsed);
                // Load cached reports immediately if available
                const cachedReports = localStorage.getItem("cachedReports");
                if (cachedReports) {
                    setReports(JSON.parse(cachedReports));
                }
                fetchReports(parsed);
            } catch (e) {
                console.error("Error parsing cached location", e);
            }
        }

        getCurrentLocation()
            .then((location) => {
                setUserLocation(location);
                // Cache the new location
                localStorage.setItem("userLocation", JSON.stringify(location));
                fetchReports(location);
            })
            .catch((error) => {
                console.error("Error getting location:", error);

                if (!cachedLocation) {
                    let message = "Could not get your location.";
                    if (error.code === 1) message = "Location permission denied.";
                    else if (error.code === 2) message = "Location unavailable.";
                    else if (error.code === 3) message = "Location request timed out.";

                    toast.error(`${message} Showing recent reports.`);
                    fetchDefaultReports();
                }
                setLoading(false);
            });
    }, []);

    // Handle real-time updates
    const handleNewReport = useCallback((data) => {
        setReports((prev) => [data.data, ...prev]);
    }, []);

    const handleReportUpdate = useCallback((data) => {
        setReports((prev) =>
            prev.map((report) =>
                report._id === data.reportId ? { ...report, ...data.data } : report
            )
        );
    }, []);

    useRealtimeReports(handleNewReport, handleReportUpdate);

    const toggleCategory = (catId) => {
        setFilters(prev => ({
            ...prev,
            category: prev.category.includes(catId)
                ? prev.category.filter(c => c !== catId)
                : [...prev.category, catId]
        }));
    };

    const toggleSeverity = (sev) => {
        setFilters(prev => ({
            ...prev,
            severity: prev.severity.includes(sev)
                ? prev.severity.filter(s => s !== sev)
                : [...prev.severity, sev]
        }));
    };

    return (
        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
            {/* Map */}
            <MapView
                reports={reports}
                center={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
                onMarkerClick={(report) => window.location.href = `/app/report/${report._id}`}
            />

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <Button
                        variant="secondary"
                        className="shadow-lg backdrop-blur-md bg-white/90 dark:bg-slate-900/90"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {(filters.category.length > 0 || filters.radius !== 1000) && (
                            <span className="ml-2 w-2 h-2 rounded-full bg-primary-500" />
                        )}
                    </Button>
                </div>

                <div className="pointer-events-auto">
                    <Button
                        variant="secondary"
                        className="shadow-lg backdrop-blur-md bg-white/90 dark:bg-slate-900/90"
                        onClick={() => {
                            if (userLocation) {
                                // Logic to re-center map would go here if we exposed a ref
                                fetchReports(userLocation);
                            }
                        }}
                    >
                        <Navigation className="w-4 h-4 mr-2" />
                        Recenter
                    </Button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="absolute top-16 left-4 z-[400] w-80 animate-fade-in">
                    <Card glass className="p-4 shadow-2xl border-slate-200/50 dark:border-slate-700/50">
                        <div className="space-y-6">
                            {/* Radius */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Search Radius</label>
                                    <span className="text-xs text-slate-500">{filters.radius}m</span>
                                </div>
                                <input
                                    type="range"
                                    min="100"
                                    max="5000"
                                    step="100"
                                    value={filters.radius}
                                    onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                            </div>

                            {/* Categories */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Categories</label>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto scrollbar-hide">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${filters.category.includes(cat.id)
                                                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800"
                                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                                }`}
                                        >
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Severity</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((sev) => (
                                        <button
                                            key={sev}
                                            onClick={() => toggleSeverity(sev)}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${filters.severity.includes(sev)
                                                ? "bg-slate-800 text-white border-slate-800"
                                                : "bg-slate-50 text-slate-400 border-slate-200"
                                                }`}
                                        >
                                            {sev}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => {
                                    fetchReports(userLocation);
                                    setShowFilters(false);
                                }}
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Bottom Stats */}
            <div className="absolute bottom-8 left-4 z-[400] pointer-events-none">
                <Card glass className="px-4 py-2 flex items-center gap-3 shadow-lg backdrop-blur-md bg-white/90 dark:bg-slate-900/90 pointer-events-auto">
                    <div className="flex -space-x-2">
                        {reports.slice(0, 3).map((r, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 flex items-center justify-center text-xs">
                                {CATEGORIES.find(c => c.id === r.category)?.icon || "📌"}
                            </div>
                        ))}
                        {reports.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                                +{reports.length - 3}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{reports.length} Reports</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Nearby</p>
                    </div>
                </Card>
            </div>

            {/* Floating Create Button */}
            <Link
                to="/app/create-report"
                className="absolute bottom-8 right-4 z-[400] group"
            >
                <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/40 transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                    <Plus className="w-7 h-7" />
                </div>
            </Link>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            )}
        </div>
    );
};

export default MapPage;
