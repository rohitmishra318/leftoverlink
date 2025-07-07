// components/Map.js
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// 🔘 Component to animate to user location
const FlyToUserLocation = ({ location, shouldFly }) => {
  const map = useMap();

  useEffect(() => {
    if (location && shouldFly) {
      map.flyTo(location, 15);
      L.popup()
        .setLatLng(location)
        .setContent("📍 You are here!")
        .openOn(map);
    }
  }, [location, shouldFly, map]);

  return null;
};

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [flyToUser, setFlyToUser] = useState(false);
  const hasFlown = useRef(false); // to avoid repeated flyTo

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation([26.2183, 78.1828]); // Fallback location
      }
    );
  }, []);

  // Fetch nearby NGOs
  useEffect(() => {
    fetch("http://localhost:4000/api/users/ngos")
      .then(res => res.json())
      .then(data => setNgos(data.ngos || []))
      .catch(err => console.error("Error fetching NGOs:", err));
  }, []);

  // Only allow one fly action
  const handleShowLocation = () => {
    if (!hasFlown.current) {
      setFlyToUser(true);
      hasFlown.current = true;
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* 🟢 Button to center on user */}
      <button
        className="absolute z-[1000] top-3 left-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        onClick={handleShowLocation}
      >
        Show My Location
      </button>

      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={13}
          className="w-full h-[500px] rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marker for current user */}
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>

          {/* NGO markers */}
          {ngos.map((ngo, i) => (
            <Marker key={i} position={[ngo.lat, ngo.lng]}>
              <Popup>
                <strong>{ngo.name}</strong><br />
                {ngo.address || ngo.location}
              </Popup>
            </Marker>
          ))}

          {/* Fly-to logic */}
          <FlyToUserLocation location={userLocation} shouldFly={flyToUser} />
        </MapContainer>
      )}
    </div>
  );
};

export default Map;
