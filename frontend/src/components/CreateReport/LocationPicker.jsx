import { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCurrentLocation } from "../../utils/helpers";

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

    const selectLocation = (lat, lng) => {
        onLocationSelect({ latitude: lat, longitude: lng });

        // Remove old marker
        if (marker.current) {
            marker.current.remove();
        }

        // Create custom blue marker
        const blueIcon = L.divIcon({
            className: "custom-location-marker",
            html: `
                <div style="
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background-color: #3b82f6;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });

        // Add new marker
        marker.current = L.marker([lat, lng], { icon: blueIcon }).addTo(map.current);

        // Center map
        map.current.flyTo([lat, lng], 16, { duration: 1 });
    };

    const handleUseMyLocation = async () => {
        try {
            setLoading(true);
            const location = await getCurrentLocation();
            selectLocation(location.latitude, location.longitude);
        } catch (error) {
            console.error("Geolocation error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (map.current) return;

        // Initialize map
        map.current = L.map(mapContainer.current).setView([20.5937, 78.9629], 5);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map.current);

        // Add click handler
        map.current.on("click", (e) => {
            const { lat, lng } = e.latlng;
            selectLocation(lat, lng);
        });

        // Auto-get location on mount if not already selected
        if (!selectedLocation && !loading) {
            handleUseMyLocation();
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Select Location</h2>
                <p className="text-gray-600 mb-4">
                    Click on the map to select the incident location, or use your current location
                </p>

                <button
                    onClick={handleUseMyLocation}
                    disabled={loading}
                    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Getting location...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            Use My Location
                        </>
                    )}
                </button>
            </div>

            <div ref={mapContainer} className="h-96 w-full rounded-lg border-2 border-gray-300" />

            {selectedLocation && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Location selected: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
