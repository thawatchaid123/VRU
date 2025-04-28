import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import './Map.css';
// กำหนดไอคอนของ Marker
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const Map = () => {
  return (
    <MapContainer
      center={[13.736717, 100.523186]}
      zoom={8}
      style={{ 
        height: "400px", 
        width: "70%", 
        border: '2px solid #d20d0d', 
        borderRadius: '8px' ,
        position: 'relative', // เพื่อให้แผนที่อยู่กับที่
        marginTop: '20px', // เพิ่มระยะห่างจากคอนเทนต์ก่อนหน้า
        zIndex: 1 // กำหนดลำดับของคอนเทนต์
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[13.736717, 100.523186]}>
        <Popup>นี่คือกรุงเทพมหานคร!</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
