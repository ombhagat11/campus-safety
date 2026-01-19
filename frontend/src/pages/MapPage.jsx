import { useState, useEffect, useCallback } from "react";
import MapView from "../components/Map/MapView";
import { getNearbyReports } from "../services/reportsService";
import { getCurrentLocation } from "../utils/helpers";
import { useRealtimeReports } from "../hooks/useSocket";
import { Link } from "react-router-dom";
import apiClient from "../services/apiClient";

const MapPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [filters, setFilters] = useState({
        category: [],
        severity: [1, 2, 3, 4, 5],
        radius: 500,
    });

    // Fetch reports when location or filters change
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                limit: 500, // Large limit to show "all" reports on map
                ...(filters.category.length > 0 && { category: filters.category.join(',') }),
            };

            const response = await apiClient.get('/reports', { params });
            setReports(response.data.data.reports || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Get user location on mount
    useEffect(() => {
        fetchReports(); // Fetch all reports immediately
        getCurrentLocation()
            .then((location) => {
                setUserLocation(location);
            })
            .catch((error) => {
                console.error("Error getting location:", error);
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

    // Handle marker click
    const handleMarkerClick = (report) => {
        // Could open modal or navigate to detail page
        window.location.href = `/app/report/${report._id}`;
    };

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
            {/* Map */}
            <MapView
                reports={reports}
                center={userLocation ? [userLocation.latitude, userLocation.longitude] : undefined}
                onMarkerClick={handleMarkerClick}
                onMapLoad={setMapInstance}
            />

            {/* Floating Create Button */}
            <Link
                to="/app/create-report"
                className="fixed bottom-8 right-8 z-[1000] flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
                title="Create Report"
            >
                <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            </Link>

            {/* Filter Panel */}
            <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm hidden md:block border border-slate-200">
                <h3 className="font-bold text-lg mb-3">Filters</h3>

                {/* Radius Selector */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                        Radius: {filters.radius}m
                    </label>
                    <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={filters.radius}
                        onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                        className="w-full"
                    />
                </div>

                {/* Severity Filter */}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((sev) => (
                            <button
                                key={sev}
                                onClick={() => {
                                    setFilters({
                                        ...filters,
                                        severity: filters.severity.includes(sev)
                                            ? filters.severity.filter((s) => s !== sev)
                                            : [...filters.severity, sev],
                                    });
                                }}
                                className={`px-2 py-1 rounded text-xs ${filters.severity.includes(sev)
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                    }`}
                            >
                                {sev}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recenter Button */}
                <button
                    onClick={() => {
                        getCurrentLocation().then(loc => {
                            setUserLocation(loc);
                            if (mapInstance) {
                                mapInstance.flyTo([loc.latitude, loc.longitude], 15);
                            }
                        });
                    }}
                    className="w-full mb-3 bg-white border border-blue-600 text-blue-600 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-50"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    My Location
                </button>

                <button
                    onClick={() => fetchReports()}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Apply Filters
                </button>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1001]">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Report Count */}
            <div className="absolute bottom-8 left-8 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 border border-slate-200">
                <p className="text-sm font-semibold text-slate-900">
                    {reports.length} {reports.length === 1 ? "report" : "reports"} nearby
                </p>
            </div>
        </div>
    );
};

export default MapPage;
