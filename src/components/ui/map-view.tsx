"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issues in Next.js/Leaflet
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

// Define custom icon
const customIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapViewProps {
    center: [number, number]; // [lat, lng]
    zoom?: number;
    markers?: Array<{
        position: [number, number];
        title?: string;
    }>;
    className?: string;
    height?: string;
}

// Component to handle dynamic map movement
function FlyToCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, {
                duration: 1.5 // Smooth animation
            });
        }
    }, [map, center, zoom]);
    return null;
}

export function MapView({
    center,
    zoom = 16,
    markers = [],
    className = "",
    height = "300px"
}: MapViewProps) {

    // Default markers if none provided but center is set (assume center is the target)
    const activeMarkers = markers.length > 0 ? markers : [{ position: center, title: "Location" }];

    return (
        <div style={{ height, width: "100%", overflow: "hidden", borderRadius: "0.5rem" }} className={className}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                {/* CartoDB Voyager Tiles - Clean, Premium Look */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <FlyToCenter center={center} zoom={zoom} />

                {activeMarkers.map((marker, idx) => (
                    <Marker key={idx} position={marker.position} icon={customIcon}>
                        {marker.title && <Popup>{marker.title}</Popup>}
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

// Export default for dynamic import usage
export default MapView;
