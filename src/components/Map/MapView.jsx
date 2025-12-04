import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./MapView.css";

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
const MapView = ({ reports = [], center, zoom, onMarkerClick, onMapLoad }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markerCluster = useRef(null);

    // Initialize map
    useEffect(() => {
        if (map.current) return; // Initialize only once

        // Safety check for existing instance
        if (mapContainer.current && mapContainer.current._leaflet_id) {
            mapContainer.current._leaflet_id = null;
        }

        try {
            // Default to India's center (New Delhi region) with zoom level 5 for country view
            const defaultCenter = [20.5937, 78.9629]; // [latitude, longitude] for India
            const initialCenter = center || defaultCenter;
            const initialZoom = zoom || (center ? 15 : 5); // Use provided zoom, or 15 for specific location, 5 for India view

            map.current = L.map(mapContainer.current, {
                zoomControl: false,
                attributionControl: false
            }).setView(initialCenter, initialZoom);

            // Add OpenStreetMap tiles with a custom style (CartoDB Voyager is clean)
            L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19,
            }).addTo(map.current);

            // Add zoom control to bottom-right
            L.control.zoom({
                position: 'bottomright'
            }).addTo(map.current);

            // Initialize marker cluster group with custom styling
            markerCluster.current = L.markerClusterGroup({
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: function (cluster) {
                    const count = cluster.getChildCount();
                    let c = ' marker-cluster-';
                    if (count < 10) {
                        c += 'small';
                    } else if (count < 100) {
                        c += 'medium';
                    } else {
                        c += 'large';
                    }

                    return new L.DivIcon({
                        html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white font-bold border-4 border-white shadow-lg">${count}</div>`,
                        className: 'custom-cluster-icon',
                        iconSize: new L.Point(40, 40)
                    });
                }
            });

            map.current.addLayer(markerCluster.current);

            // Call onMapLoad callback
            if (onMapLoad) {
                onMapLoad(map.current);
            }
        } catch (error) {
            console.error("Error initializing map:", error);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update map center when prop changes
    useEffect(() => {
        if (map.current && center) {
            map.current.flyTo(center, 13, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center]);



    // Update markers when reports change
    useEffect(() => {
        if (!map.current || !markerCluster.current) return;

        // Clear existing markers
        markerCluster.current.clearLayers();

        // Add new markers
        reports.forEach((report) => {
            if (!report.location?.coordinates) return;

            const [lng, lat] = report.location.coordinates;

            // Create custom icon based on severity
            const color = getSeverityColor(report.severity);
            const icon = L.divIcon({
                className: "custom-marker",
                html: `
                    <div style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)});
                        border: 3px solid white;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        cursor: pointer;
                        transition: transform 0.2s;
                    ">
                        ${getCategoryIcon(report.category)}
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            });

            // Create marker
            const marker = L.marker([lat, lng], { icon });

            // Create popup with modern styling
            const popupContent = `
                <div class="font-sans min-w-[240px] p-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xl">${getCategoryIcon(report.category)}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                            ${getCategoryLabel(report.category)}
                        </span>
                    </div>
                    <h3 class="font-bold text-lg text-slate-900 mb-1 leading-tight">${report.title}</h3>
                    <p class="text-xs text-slate-500 mb-3 flex items-center gap-1">
                        <span>Severity:</span>
                        <span class="font-bold" style="color: ${color}">${report.severity}/5</span>
                        <span class="mx-1">•</span>
                        <span>${new Date(report.createdAt).toLocaleDateString()}</span>
                    </p>
                    <button 
                        onclick="window.viewReportDetails('${report._id}')"
                        class="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                        View Details
                    </button>
                </div>
            `;

            marker.bindPopup(popupContent, {
                className: 'custom-popup',
                closeButton: false,
                maxWidth: 300,
                minWidth: 240
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

    return <div ref={mapContainer} className="w-full h-full bg-slate-100" />;
};

// Helper functions
const getSeverityColor = (severity) => {
    const colors = {
        1: "#10b981", // emerald-500
        2: "#3b82f6", // blue-500
        3: "#f59e0b", // amber-500
        4: "#f97316", // orange-500
        5: "#ef4444", // red-500
    };
    return colors[severity] || "#6b7280";
};

// Simple color adjuster for gradient
const adjustColor = (color, amount) => {
    return color; // Placeholder, real implementation would darken/lighten hex
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
        suspicious_activity: "Suspicious",
        emergency: "Emergency",
        fire: "Fire",
        medical: "Medical",
        hazard: "Hazard",
        other: "Other",
    };
    return labels[category] || category;
};

export default MapView;
