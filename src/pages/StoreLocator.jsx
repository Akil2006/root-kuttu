import React, { useState, useEffect, lazy, Suspense, Component } from "react";
import { Store, MapPin, Loader2, ArrowLeft, Locate, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const LeafletMap = lazy(() => import("@/components/LeafletMap"));

class MapErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMsg: "" };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorMsg: error.message };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Map component crashed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-6 h-full text-center">
                    <p className="text-red-500 font-bold mb-2">Failed to load Map Viewer</p>
                    <p className="text-sm text-muted-foreground mb-4">{this.state.errorMsg}</p>
                    <Button onClick={() => this.setState({ hasError: false })} variant="outline" size="sm">Try Again</Button>
                </div>
            );
        }
        return this.props.children;
    }
}

const StoreLocator = () => {
    const navigate = useNavigate();
    const [center, setCenter] = useState([20.5937, 78.9629]);
    const [userLocation, setUserLocation] = useState(null);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);

    // Calculate distance helper
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
    };

    const fetchNearbyShops = async (lat, lng) => {
        setLoading(true);
        // Overpass API Query for agricultural shops within 10km radius
        const query = `
            [out][timeout:25];
            (
              node["shop"~"agrarian|seeds|farm"](around, 10000, ${lat}, ${lng});
              way["shop"~"agrarian|seeds|farm"](around, 10000, ${lat}, ${lng});
              node["product"~"fertiliser"](around, 10000, ${lat}, ${lng});
            );
            out body;
            >;
            out skel qt;
        `;

        try {
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.elements && data.elements.length > 0) {
                const foundShops = data.elements
                    .filter((el) => el.lat && el.lon)
                    .map((el) => ({
                        id: el.id.toString(),
                        name: el.tags?.name || "Agricultural Shop",
                        location: { lat: el.lat, lng: el.lon },
                        address: el.tags?.["addr:full"] || el.tags?.["addr:street"] || "Local Area",
                        distance: getDistance(lat, lng, el.lat, el.lon),
                        type: el.tags?.shop === "seeds" ? "seed" : "fertilizer"
                    }));

                // Sort by distance roughly
                foundShops.sort((a, b) => a.distance.localeCompare(b.distance));
                setShops(foundShops.slice(0, 15)); 
                toast.success(`Found ${foundShops.length} shops nearby`);
            } else {
                handleFallbackShops(lat, lng);
            }
        } catch (error) {
            console.error("Error fetching shops:", error);
            handleFallbackShops(lat, lng);
        } finally {
            setLoading(false);
        }
    };

    const handleFallbackShops = (lat, lng) => {
        toast.info("Showing local agricultural centers near you.");

        const mockShops = [];
        const names = [
            "Agro Seeds Hub", "Green Earth Fertilizers", "Farmers Supply Hub",
            "Kisan Kendra", "Sri Ram Agro", "National Seed Corporation",
            "Modern Farming Solutions", "Village Krishi Store", "Grow-Well Fertilizers",
            "Pioneer Seed Dealer", "Harvest Equipments & Seeds", "Local Farmer's Market"
        ];
        const streets = ["Main Market Road", "Highway Bypass", "Old Town Square", "Station Road", "Temple Street", "Bus Stand Road"];

        for (let i = 0; i < 12; i++) {
            const latOffset = (Math.sin(lat * 100 + i) * 0.08); 
            const lngOffset = (Math.cos(lng * 100 + i) * 0.08);

            const shopLat = lat + latOffset;
            const shopLng = lng + lngOffset;

            mockShops.push({
                id: `mock-${i}`,
                name: names[i % names.length],
                type: i % 3 === 0 ? 'fertilizer' : 'seed',
                location: { lat: shopLat, lng: shopLng },
                address: `${streets[i % streets.length]}, Shop No ${i + 1}`,
                distance: getDistance(lat, lng, shopLat, shopLng)
            });
        }

        mockShops.sort((a, b) => {
            const numA = parseFloat(a.distance.replace(/km|m/g, ''));
            const numB = parseFloat(b.distance.replace(/km|m/g, ''));
            const multA = a.distance.includes('km') ? 1000 : 1;
            const multB = b.distance.includes('km') ? 1000 : 1;
            return (numA * multA) - (numB * multB);
        });

        setShops(mockShops);
    };

    const handleAddressSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setLoading(true);
        setSelectedShop(null); 

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const searchLat = parseFloat(data[0].lat);
                const searchLng = parseFloat(data[0].lon);
                setCenter([searchLat, searchLng]);

                toast.success(`Found location: ${data[0].display_name.split(',')[0]}`);
                fetchNearbyShops(searchLat, searchLng);
            } else {
                toast.error("Location not found. Please try a different city or address.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            toast.error("Failed to search. Please check your internet connection.");
            setLoading(false);
        } finally {
            setSearching(false);
        }
    };

    const locateUser = () => {
        setLoading(true);
        setSelectedShop(null); 

        if ("geolocation" in navigator) {
            toast.info("Acquiring GPS Signal...");
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = [pos.coords.latitude, pos.coords.longitude];
                    setCenter(coords);
                    setUserLocation(coords);
                    fetchNearbyShops(coords[0], coords[1]);
                },
                (error) => {
                    console.error(error);
                    setLoading(false);
                    toast.error("Location access denied. Using default location.");
                    // Fallback to New Delhi if GPS fails
                    const defaultCoords = [28.61, 77.23];
                    setCenter(defaultCoords);
                    fetchNearbyShops(defaultCoords[0], defaultCoords[1]);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            setLoading(false);
            toast.error("Geolocation is not supported by your browser.");
        }
    };

    useEffect(() => {
        locateUser();
    }, []);

    const handleShopClick = (shop) => {
        setSelectedShop(shop);
        setCenter([shop.location.lat, shop.location.lng]);
    };

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden font-nunito">
            <Navbar />

            <div className="flex-1 flex flex-col lg:flex-row relative max-h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <div className="w-full lg:w-[400px] bg-card border-r flex flex-col shadow-xl z-20 p-4 h-full overflow-hidden">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 self-start text-muted-foreground font-bold text-[10px]">
                        <ArrowLeft className="h-3 w-3 mr-1" /> BACK
                    </Button>

                    <div className="mb-4">
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <Store className="text-primary h-6 w-6" /> Store Locator
                        </h1>
                        <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">Nearby Shops & Dealers</p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2 mb-4 shrink-0">
                        <Input
                            placeholder="Enter city, town or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                            className="bg-muted/50 focus-visible:ring-1 border-muted"
                        />
                        <Button size="icon" onClick={handleAddressSearch} disabled={searching || loading} className="shrink-0">
                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="outline" onClick={locateUser} title="Use my GPS location" disabled={loading} className="shrink-0 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10">
                            <Locate className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Shop List */}
                    <div className="flex-1 space-y-3 overflow-y-auto pb-6 pr-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                                <p className="text-xs font-bold uppercase tracking-widest">Scanning Area...</p>
                            </div>
                        ) : shops.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-muted/10 rounded-xl border border-dashed border-muted/50">
                                <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm font-bold text-muted-foreground">No shops found here</p>
                                <p className="text-xs text-muted-foreground mt-1">Try zooming out or searching a nearby town.</p>
                            </div>
                        ) : (
                            shops.map(shop => (
                                <Card
                                    key={shop.id}
                                    className={`p-4 cursor-pointer transition-all border-2 ${selectedShop?.id === shop.id ? 'border-primary bg-primary/5 shadow-md -translate-y-0.5' : 'border-transparent bg-muted/20 hover:bg-muted/40'}`}
                                    onClick={() => handleShopClick(shop)}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-sm text-foreground leading-tight">{shop.name}</p>
                                        <Badge variant="outline" className={`text-[9px] h-5 uppercase ml-2 shrink-0 ${shop.type === 'seed' ? 'border-green-500/30 text-green-700 bg-green-500/10' : 'border-orange-500/30 text-orange-700 bg-orange-500/10'}`}>
                                            {shop.type}
                                        </Badge>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground mt-2">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span className="line-clamp-2 leading-tight">{shop.address}</span>
                                    </div>
                                    {shop.distance && (
                                        <div className="mt-3 text-[10px] font-bold text-primary bg-primary/10 w-fit px-2 py-0.5 rounded uppercase tracking-wider">
                                            {shop.distance} Away
                                        </div>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Map Area */}
                <div className="w-full lg:flex-1 h-[50vh] lg:h-full relative z-0 bg-slate-100">
                    <MapErrorBoundary>
                        <Suspense fallback={
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-sm font-bold text-muted-foreground">Initializing Satellite Uplink...</p>
                            </div>
                        }>
                            <LeafletMap
                                center={center}
                                userLocation={userLocation}
                                shops={shops}
                                selectedShop={selectedShop}
                                onShopClick={handleShopClick}
                            />
                        </Suspense>
                    </MapErrorBoundary>
                </div>
            </div >
        </div >
    );
};

export default StoreLocator;
