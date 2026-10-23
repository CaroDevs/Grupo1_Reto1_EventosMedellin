import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import './leafletIconFix';

const MEDELLIN_CENTER: [number, number] = [6.2442, -75.5812];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string;
  longitude: string;
  onChange: (lat: number, lng: number) => void;
}) {
  const position: [number, number] | null =
    latitude && longitude ? [Number(latitude), Number(longitude)] : null;

  return (
    <div style={{ height: '250px', width: '100%' }} className="rounded overflow-hidden border">
      <MapContainer
        center={position ?? MEDELLIN_CENTER}
        zoom={position ? 15 : 12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
}
