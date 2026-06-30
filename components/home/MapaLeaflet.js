'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, Clock, Phone } from 'lucide-react';

// Fix para que las rutas de los íconos por defecto de Leaflet resuelvan correctamente en entornos SSR/Webpack de Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const iconoDonacion = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const BUENOS_AIRES = { lat: -34.6037, lng: -58.3816 };
const ZOOM_INICIAL = 12;

export default function MapaLeaflet({ centros }) {
  return (
    <MapContainer
      center={[BUENOS_AIRES.lat, BUENOS_AIRES.lng]}
      zoom={ZOOM_INICIAL}
      style={{ height: '100%', width: '100%', borderRadius: '14px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {centros.map((centro) => (
        <Marker
          key={centro.id}
          position={[centro.latitud, centro.longitud]}
          icon={iconoDonacion}
        >
          <Popup
            maxWidth={280}
            className="donavida-popup"
          >
            <div style={{ fontFamily: 'var(--font-body)', minWidth: '220px' }}>
              <div
                className="flex items-start gap-2 mb-2 pb-2"
                style={{ borderBottom: '1px solid #E2E8F0' }}
              >
                <Building2 size={20} style={{ color: '#0F1D2E', flexShrink: 0 }} aria-hidden="true" />
                <div>
                  <p
                    className="font-bold text-sm leading-tight"
                    style={{ fontFamily: 'var(--font-heading)', color: '#0F1D2E' }}
                  >
                    {centro.nombre}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#718096' }}>
                    {centro.direccion}
                  </p>
                </div>
              </div>

              {centro.descripcion && (
                <p className="text-xs mb-2" style={{ color: '#4A5568', lineHeight: '1.5' }}>
                  {centro.descripcion}
                </p>
              )}

              <div className="flex flex-col gap-0.5 mb-3">
                {centro.horario && (
                  <p className="text-xs flex items-center gap-1" style={{ color: '#718096' }}>
                    <Clock size={12} aria-hidden="true" /> {centro.horario}
                  </p>
                )}
                {centro.telefono && (
                  <p className="text-xs flex items-center gap-1" style={{ color: '#718096' }}>
                    <Phone size={12} aria-hidden="true" /> {centro.telefono}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {centro.grupos_compatibles.map((grupo) => (
                  <span
                    key={grupo}
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: '#FDE8EB',
                      color: '#C0152A',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {grupo}
                  </span>
                ))}
              </div>

              <a
                href={`/reservar?centro_id=${centro.id}`}
                className="block w-full text-center text-xs font-bold py-2 px-3 rounded-lg transition-all duration-150"
                style={{
                  backgroundColor: '#C0152A',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-heading)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A01022')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C0152A')}
              >
                Agendar turno →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
