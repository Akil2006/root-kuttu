import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

// Standard Leaflet Icon Fix (Ensure it only runs in browser)
if (typeof window !== "undefined" && L && L.Marker) {
    const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
}

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface LeafletMapProps {
    center: [number, number];
    userLocation: [number, number] | null;
    shops: any[];
    selectedShop?: any;
    onShopClick: (shop: any) => void;
}

const LeafletMap = ({ center, userLocation, shops, selectedShop, onShopClick }: LeafletMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map only once
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView(center, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance.current);
        } else {
            // Update center smoothly to selected shop or search location
            mapInstance.current.flyTo(center, selectedShop ? 16 : 13, {
                animate: true,
                duration: 1.5
            });
        }

        const map = mapInstance.current;

        // Clear existing markers
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];

        // Add user location marker
        if (userLocation) {
            const userMarker = L.marker(userLocation, { icon: blueIcon }).addTo(map);
            userMarker.bindPopup("You are here");
            markersRef.current.push(userMarker);
        }

        // Add shop markers
        shops.forEach((shop) => {
            const icon = shop.type === "seed" ? greenIcon : orangeIcon;
            const marker = L.marker([shop.location.lat, shop.location.lng], { icon }).addTo(map);

            // Create popup content manually
            const popupContent = document.createElement("div");
            popupContent.className = "p-1 min-w-[120px]";
            popupContent.innerHTML = `
                <h3 class="font-bold text-sm mb-1">${shop.name}</h3>
                <p class="text-[10px] text-gray-600 mb-2 truncate">${shop.address || 'Local Shop'}</p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${shop.location.lat},${shop.location.lng}" 
                   target="_blank" 
                   class="block w-full text-center bg-green-600 text-white text-[10px] font-bold py-2 px-3 rounded mt-2 uppercase decoration-none hover:bg-green-700 transition">
                    Directions
                </a>
            `;

            marker.bindPopup(popupContent);

            // Interaction logic
            marker.on('click', () => {
                onShopClick(shop);
            });

            // Automatically open if selected
            if (selectedShop && selectedShop.id === shop.id) {
                // Short delay to let the flyTo finish before opening popup
                setTimeout(() => {
                    marker.openPopup();
                }, 100);
            }

            markersRef.current.push(marker);
        });

        // Force a resize to fix grey tiles / white map bugs
        setTimeout(() => {
            map.invalidateSize();
        }, 300);

    }, [center, userLocation, shops, selectedShop, onShopClick]);

    return (
        <div ref={mapRef} className="w-full h-full min-h-[400px] bg-slate-100 z-0 border rounded-xl overflow-hidden shadow-inner" />
    );
};

export default LeafletMap;
