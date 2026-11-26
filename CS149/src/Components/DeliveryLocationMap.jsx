import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [12.9716, 77.5946]; // Bengaluru

const PIN_ICON = L.divIcon({
    className: "sm-map-pin-wrapper",
    html: `<div class="sm-map-pin"><span>📍</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 32]
});

function formatNominatimAddress(data) {
    const addr = data?.address || {};
    const parts = [
        addr.amenity || addr.building || addr.university || addr.college,
        [addr.house_number, addr.road].filter(Boolean).join(" "),
        addr.neighbourhood || addr.suburb || addr.quarter || addr.residential,
        addr.county
    ].filter(Boolean);

    const uniqueParts = [...new Set(parts)];
    const streetAddress = uniqueParts.join(", ") || data?.display_name || "";
    const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.state_district ||
        "";
    const postalCode = addr.postcode || "";

    return {
        address: streetAddress,
        city,
        postalCode,
        displayName: data?.display_name || streetAddress
    };
}

function DeliveryLocationMap({ latitude, longitude, onLocationSelect }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const onSelectRef = useRef(onLocationSelect);
    const initialCoordsRef = useRef({ latitude, longitude });

    const [locating, setLocating] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [statusMsg, setStatusMsg] = useState("");
    const [statusType, setStatusType] = useState(""); // "info" | "error" | "success"

    useEffect(() => {
        onSelectRef.current = onLocationSelect;
    }, [onLocationSelect]);

    const reverseGeocode = useCallback(async (lat, lng) => {
        try {
            setStatusMsg("Fetching address for pinned location...");
            setStatusType("info");

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                    lat
                )}&lon=${encodeURIComponent(lng)}&addressdetails=1`,
                {
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Reverse geocoding unavailable");
            }

            const data = await response.json();
            const parsed = formatNominatimAddress(data);

            onSelectRef.current?.({
                lat,
                lng,
                ...parsed
            });

            setStatusMsg("Location pinned and delivery address updated.");
            setStatusType("success");
        } catch {
            onSelectRef.current?.({
                lat,
                lng,
                address: "",
                city: "",
                postalCode: "",
                displayName: ""
            });
            setStatusMsg(
                `Pinned coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)}). Enter address details manually if needed.`
            );
            setStatusType("info");
        }
    }, []);

    const placeOrMoveMarker = useCallback((lat, lng, zoom = 16) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        map.setView([lat, lng], zoom, { animate: true });

        if (!markerRef.current) {
            const marker = L.marker([lat, lng], {
                icon: PIN_ICON,
                draggable: true
            }).addTo(map);

            marker.on("dragend", () => {
                const pos = marker.getLatLng();
                reverseGeocode(pos.lat, pos.lng);
            });

            markerRef.current = marker;
        } else {
            markerRef.current.setLatLng([lat, lng]);
        }
    }, [reverseGeocode]);

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const { latitude: initLat, longitude: initLng } = initialCoordsRef.current;
        const initialLat = typeof initLat === "number" ? initLat : DEFAULT_CENTER[0];
        const initialLng = typeof initLng === "number" ? initLng : DEFAULT_CENTER[1];
        const initialZoom = typeof initLat === "number" ? 16 : 12;

        const map = L.map(mapContainerRef.current, {
            center: [initialLat, initialLng],
            zoom: initialZoom
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }).addTo(map);

        map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            placeOrMoveMarker(lat, lng, Math.max(map.getZoom(), 16));
            reverseGeocode(lat, lng);
        });

        mapInstanceRef.current = map;

        if (typeof initLat === "number" && typeof initLng === "number") {
            placeOrMoveMarker(initLat, initLng, 16);
        }

        // Fix Leaflet container size calculation inside layouts
        setTimeout(() => {
            map.invalidateSize();
        }, 150);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
        };
    }, [placeOrMoveMarker, reverseGeocode]);

    const handleFetchLiveLocation = () => {
        if (!navigator.geolocation) {
            setStatusMsg("Geolocation is not supported by your browser.");
            setStatusType("error");
            return;
        }

        setLocating(true);
        setStatusMsg("Requesting your live GPS location...");
        setStatusType("info");
        setSearchResults([]);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                placeOrMoveMarker(lat, lng, 17);
                await reverseGeocode(lat, lng);
                setLocating(false);
            },
            (err) => {
                setLocating(false);
                if (err.code === err.PERMISSION_DENIED) {
                    setStatusMsg("Location access denied. Please allow location permission or click on the map.");
                } else if (err.code === err.TIMEOUT) {
                    setStatusMsg("Location request timed out. Try again or pick your location on the map.");
                } else {
                    setStatusMsg("Unable to fetch live location. You can search or click directly on the map.");
                }
                setStatusType("error");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSearchPlace = async (e) => {
        if (e) e.preventDefault();
        const query = searchText.trim();
        if (!query) return;

        try {
            setSearching(true);
            setStatusMsg("");
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
                    query
                )}&limit=5&addressdetails=1`,
                {
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Search failed");
            }

            const results = await response.json();
            setSearchResults(results || []);
            if (!results || results.length === 0) {
                setStatusMsg("No matching locations found. Try a nearby landmark or click on the map.");
                setStatusType("info");
            }
        } catch {
            setStatusMsg("Location search unavailable right now. Use live location or click on the map.");
            setStatusType("error");
        } finally {
            setSearching(false);
        }
    };

    const handleSelectSearchResult = (item) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const parsed = formatNominatimAddress(item);

        placeOrMoveMarker(lat, lng, 16);
        onSelectRef.current?.({
            lat,
            lng,
            ...parsed
        });
        setSearchResults([]);
        setStatusMsg("Selected location pinned on map.");
        setStatusType("success");
    };

    return (
        <div className="cart-map-box">
            <div className="cart-map-toolbar">
                <button
                    type="button"
                    className="cart-map-locate-btn"
                    onClick={handleFetchLiveLocation}
                    disabled={locating}
                >
                    {locating ? "📡 Detecting Location..." : "📍 Use Live Location"}
                </button>

                <div className="cart-map-search-row">
                    <input
                        type="text"
                        className="cart-map-search-input"
                        placeholder="Search hostel, campus, street..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearchPlace();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="cart-map-search-btn"
                        onClick={handleSearchPlace}
                        disabled={searching}
                    >
                        {searching ? "..." : "Find"}
                    </button>
                </div>
            </div>

            {searchResults.length > 0 && (
                <ul className="cart-map-results">
                    {searchResults.map((res) => (
                        <li key={res.place_id}>
                            <button
                                type="button"
                                onClick={() => handleSelectSearchResult(res)}
                            >
                                📍 {res.display_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div
                ref={mapContainerRef}
                className="cart-map-canvas"
                aria-label="Interactive delivery location map"
            />

            <div className="cart-map-footer">
                <span className="cart-map-hint">
                    Click anywhere on the map or drag the pin to adjust your delivery spot.
                </span>
                {typeof latitude === "number" && typeof longitude === "number" && (
                    <span className="cart-map-coords">
                        Pin: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </span>
                )}
            </div>

            {statusMsg && (
                <p className={`cart-map-status ${statusType || "info"}`}>
                    {statusMsg}
                </p>
            )}
        </div>
    );
}

export default DeliveryLocationMap;
