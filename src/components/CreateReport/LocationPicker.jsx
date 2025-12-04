import { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";
import { getCurrentLocation } from "../../utils/helpers";
import Button from "../ui/Button";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationPicker = ({ selectedLocation, onLocationSelect }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (map.current) return;

        // Initialize map
        map.current = L.map(mapContainer.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([20.5937, 78.9629], 5);

        // Add CartoDB Voyager tiles for a cleaner look
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19,
        }).addTo(map.current);

        // Add zoom control to bottom-right
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map.current);

        // Add click handler
        map.current.on("click", (e) => {
            const { lat, lng } = e.latlng;
            selectLocation(lat, lng);
        });

        // If initial location is provided, set it
        if (selectedLocation) {
            selectLocation(selectedLocation.latitude, selectedLocation.longitude, false);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    const selectLocation = (lat, lng, flyTo = true) => {
        onLocationSelect({ latitude: lat, longitude: lng });

        // Remove old marker
        if (marker.current) {
            marker.current.remove();
        }

        // Create custom marker icon
        const icon = L.divIcon({
            className: "custom-location-marker",
            html: `
                <div class="relative flex items-center justify-center w-8 h-8">
                    <div class="absolute w-full h-full bg-primary-500 rounded-full opacity-30 animate-ping"></div>
                    <div class="relative w-8 h-8 bg-primary-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        // Add new marker
        marker.current = L.marker([lat, lng], { icon }).addTo(map.current);

        // Center map
        if (flyTo && map.current) {
            map.current.flyTo([lat, lng], 16, { duration: 1 });
        }
    };

    const handleUseMyLocation = async () => {
        try {
            setLoading(true);
            const location = await getCurrentLocation();
            selectLocation(location.latitude, location.longitude);
        } catch (error) {
            alert("Failed to get your location. Please select manually on the map or enable location permissions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-500" />
                        Select Location
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Click on the map to pin the incident location
                    </p>
                </div>

                <Button
                    onClick={handleUseMyLocation}
                    isLoading={loading}
                    variant="secondary"
                    className="shrink-0"
                >
                    <Navigation className="w-4 h-4 mr-2" />
                    Use My Location
                </Button>
            </div>

            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                <div ref={mapContainer} className="h-full w-full z-0" />

                {/* Overlay instruction if no location selected */}
                {!selectedLocation && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5 z-10">
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium text-slate-600 dark:text-slate-300">
                            Tap anywhere on the map to pin location
                        </div>
                    </div>
                )}
            </div>

            {selectedLocation && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl animate-fade-in">
                    <p className="text-sm text-primary-800 dark:text-primary-200 flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4" />
                        Location pinned: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
