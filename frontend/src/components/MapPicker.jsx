import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Dışarıdan yeni bir koordinat geldiğinde haritayı o noktaya uçuran bileşen
const MapMover = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 14, { duration: 1.5 }); 
        }
    }, [position, map]);
    return null;
};

const LocationFinderDummy = ({ setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
};

const MapPicker = ({ position, setPosition }) => {
    const defaultCenter = [38.6810, 39.1960]; 
    const center = position || defaultCenter;

    return (
        // CSS ile tam yuvarlak (küre hissi veren) bir tasarım
        <div style={{ 
            height: '350px', 
            width: '350px', 
            margin: '0 auto', 
            marginBottom: '20px', 
            borderRadius: '50%', // Yuvarlak yapan sihir
            overflow: 'hidden', 
            border: '4px solid var(--accent-color)',
            boxShadow: 'var(--shadow)'
        }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />
                <MapMover position={position} />
                <LocationFinderDummy setPosition={setPosition} />
                {position && <Marker position={position}></Marker>}
            </MapContainer>
        </div>
    );
};

export default MapPicker;