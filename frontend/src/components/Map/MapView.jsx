import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * Leaflet Map Component
 * Displays an interactive map with markers for reports
 */
const MapView = ({ reports = [], center, onMarkerClick, onMapLoad }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markerCluster = useRef(null);

    // Initialize map
    useEffect(() => {
        if (map.current) return; // Initialize only once

        const defaultCenter = center || [20.5937, 78.9629]; // India default
        map.current = L.map(mapContainer.current).setView(defaultCenter, 5);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map.current);

        // Initialize marker cluster group
        markerCluster.current = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
        });

        map.current.addLayer(markerCluster.current);

        // Call onMapLoad callback
        if (onMapLoad) {
            onMapLoad(map.current);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update center when changed
    useEffect(() => {
        if (map.current && center) {
            map.current.flyTo(center, 13, {
                duration: 1.5,
            });
        }
    }, [center]);

    // Update markers when reports change
    useEffect(() => {
        if (!map.current || !markerCluster.current) return;

        // Clear existing markers
        markerCluster.current.clearLayers();

        const bounds = L.latLngBounds();
        let hasValidMarkers = false;

        // 1. Add User Location Marker if available
        if (center) {
            const userIcon = L.divIcon({
                className: "user-location-marker",
                html: `
                    <div class="relative">
                        <div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
                        <div style="
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: #3b82f6;
                            border: 3px solid white;
                            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                            position: relative;
                            z-index: 2;
                        "></div>
                    </div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            });
            const userMarker = L.marker(center, { icon: userIcon }).addTo(map.current);
            userMarker.bindPopup('<b class="text-blue-600">You are here</b>');
            bounds.extend(center);
            hasValidMarkers = true;
        }

        // 2. Add Incident markers
        reports.forEach((report) => {
            if (!report.location?.coordinates) return;

            const [lng, lat] = report.location.coordinates;
            const latLng = [lat, lng];
            bounds.extend(latLng);
            hasValidMarkers = true;

            // Create custom icon based on severity
            const icon = L.divIcon({
                className: "custom-marker",
                html: `
                    <div style="
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        background: white;
                        border: 3px solid ${getSeverityColor(report.severity)};
                        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    " class="hover:scale-110">
                        ${getCategoryIcon(report.category)}
                    </div>
                `,
                iconSize: [44, 44],
                iconAnchor: [22, 22],
            });

            const marker = L.marker(latLng, { icon });

            // Create popup with better styling
            const popupContent = `
                <div style="min-width: 220px; font-family: sans-serif; padding: 5px;">
                    <div style="display: flex; justify-between; align-items: center; margin-bottom: 8px;">
                        <h3 style="font-weight: 800; font-size: 16px; margin: 0; color: #1e293b;">${report.title}</h3>
                    </div>
                    <div style="background: #f1f5f9; padding: 8px; rounded: 8px; margin-bottom: 12px;">
                        <p style="font-size: 13px; color: #475569; margin: 0 0 4px 0;">
                            <strong>📁 Category:</strong> ${getCategoryLabel(report.category)}
                        </p>
                        <p style="font-size: 13px; color: #475569; margin: 0 0 4px 0;">
                            <strong>🚨 Severity:</strong> <span style="color: ${getSeverityColor(report.severity)}; font-weight: bold;">Level ${report.severity}</span>
                        </p>
                        <p style="font-size: 13px; color: #475569; margin: 0;">
                            <strong>🕒 Status:</strong> <span style="text-transform: capitalize;">${report.status}</span>
                        </p>
                    </div>
                    <button 
                        onclick="window.viewReportDetails('${report._id}')"
                        style="
                            width: 100%;
                            background: #2563eb;
                            color: white;
                            padding: 10px;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 600;
                            transition: background 0.2s;
                        "
                        onmouseover="this.style.background='#1d4ed8'"
                        onmouseout="this.style.background='#2563eb'"
                    >
                        View Full Details
                    </button>
                </div>
            `;

            marker.bindPopup(popupContent, {
                className: 'custom-popup',
                maxWidth: 300
            });

            // Add click event
            marker.on("click", () => {
                if (onMarkerClick) {
                    onMarkerClick(report);
                }
            });

            // Add to cluster
            markerCluster.current.addLayer(marker);
        });

        // Autofit map to show both markers AND the user's location
        if (hasValidMarkers) {
            // If we have markers and a user location, we should show both
            // But only auto-adjust on the first load or when filters change significantly
            map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else if (center) {
            // If no reports, just show user location
            map.current.flyTo(center, 15);
        }
    }, [reports, onMarkerClick]);

    // Expose viewReportDetails globally for popup button
    useEffect(() => {
        window.viewReportDetails = (reportId) => {
            const report = reports.find((r) => r._id === reportId);
            if (report && onMarkerClick) {
                onMarkerClick(report);
            }
        };

        return () => {
            delete window.viewReportDetails;
        };
    }, [reports, onMarkerClick]);

    return <div ref={mapContainer} className="w-full h-full" />;
};

// Helper functions
const getSeverityColor = (severity) => {
    const colors = {
        1: "#10b981", // green
        2: "#3b82f6", // blue
        3: "#f59e0b", // yellow
        4: "#f97316", // orange
        5: "#dc2626", // red
    };
    return colors[severity] || "#6b7280";
};

const getCategoryIcon = (category) => {
    const icons = {
        theft: "💰",
        assault: "⚠️",
        harassment: "🚫",
        vandalism: "🔨",
        suspicious_activity: "👁️",
        emergency: "🚨",
        fire: "🔥",
        medical: "🏥",
        hazard: "⚡",
        other: "📌",
    };
    return icons[category] || "📌";
};

const getCategoryLabel = (category) => {
    const labels = {
        theft: "Theft",
        assault: "Assault",
        harassment: "Harassment",
        vandalism: "Vandalism",
        suspicious_activity: "Suspicious Activity",
        emergency: "Emergency",
        fire: "Fire",
        medical: "Medical",
        hazard: "Hazard",
        other: "Other",
    };
    return labels[category] || category;
};

export default MapView;
