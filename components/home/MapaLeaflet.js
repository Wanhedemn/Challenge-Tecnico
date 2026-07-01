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

export default function MapaLeaflet({ centros, estadoTriage }) {
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
            maxWidth={260}
            className="donavida-popup"
          >
            <div className="flex flex-col space-y-1 max-w-xs" style={{ fontFamily: 'var(--font-body)' }}>
              {/* Título */}
              <p 
                className="text-sm font-bold leading-snug mb-1" 
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}
              >
                {centro.nombre}
              </p>

              {/* Dirección */}
              <p className="text-xs" style={{ color: 'var(--color-slate-mid)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-slate)' }}>Dirección:</span> {centro.direccion}
              </p>

              {/* Atención */}
              <p className="text-xs" style={{ color: 'var(--color-slate-mid)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-slate)' }}>Atención:</span> {centro.horario || 'Lunes a Viernes 08:00 - 13:00'}
              </p>

              {/* Línea separadora compacta */}
              <hr className="my-1 border-gray-200" />

              {/* Tipo de sangre */}
              <div>
                <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--color-slate)' }}>
                  Tipo de sangre:
                </p>
                <div className="flex flex-wrap gap-1">
                  {centro.grupos_compatibles?.map((grupo) => (
                    <span
                      key={grupo}
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: 'var(--color-primary-blush)',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-heading)',
                        border: '1px solid var(--color-primary-light)',
                      }}
                    >
                      {grupo}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón */}
              <a
                href={estadoTriage === 'apto' ? `/reservar?centro_id=${centro.id}` : '/triage'}
                className="block mt-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg px-4 py-2 w-full text-center transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {estadoTriage === 'apto' ? 'Agendar turno →' : 'Hacer Pre-Triage →'}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
