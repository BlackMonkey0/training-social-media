import React from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FALLBACK_CENTER = [40.4168, -3.7038];

function MapClickHandler({ enabled, onMapClick }) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function distanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function formatStep(step) {
  const maneuver = step?.maneuver?.type || 'continue';
  const street = step?.name ? ` por ${step.name}` : '';
  return `${maneuver}${street}`;
}

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('No se pudo geocodificar la direccion');
  const results = await response.json();
  if (!results?.length) throw new Error(`Direccion no encontrada: ${address}`);
  return [parseFloat(results[0].lat), parseFloat(results[0].lon)];
}

async function fetchRoute(points) {
  const coords = points.map((p) => `${p[1]},${p[0]}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('No se pudo calcular la ruta');
  const data = await response.json();
  if (!data.routes?.length) throw new Error('No hay ruta disponible para esos puntos');

  const route = data.routes[0];
  const geometry = route.geometry.coordinates.map((c) => [c[1], c[0]]);
  const steps = (route.legs || []).flatMap((leg) => (leg.steps || []).map(formatStep));
  return {
    points: geometry,
    steps,
    distanceKm: (route.distance || 0) / 1000,
    durationMin: (route.duration || 0) / 60,
  };
}

export default function RoutePlanner() {
  const mapRef = React.useRef(null);
  const watchRef = React.useRef(null);

  const [mode, setMode] = React.useState('addresses');
  const [center, setCenter] = React.useState(FALLBACK_CENTER);
  const [message, setMessage] = React.useState('');
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [aAddress, setAAddress] = React.useState('');
  const [bAddress, setBAddress] = React.useState('');
  const [extraStops, setExtraStops] = React.useState(['']);
  const [drawPoints, setDrawPoints] = React.useState([]);
  const [plannedRoute, setPlannedRoute] = React.useState(null);
  const [currentPos, setCurrentPos] = React.useState(null);
  const [navigationActive, setNavigationActive] = React.useState(false);

  const requestLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      setMessage('Tu navegador no soporta geolocalizacion.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setCenter(p);
        setCurrentPos(p);
        if (mapRef.current) mapRef.current.setView(p, 15);
      },
      () => setMessage('No se pudo obtener tu ubicacion.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  React.useEffect(() => {
    requestLocation();
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [requestLocation]);

  const addressPointCount = 2 + extraStops.filter((s) => s.trim()).length;
  const rawRoutePoints = mode === 'draw' ? drawPoints : null;

  const handleAddStop = () => setExtraStops((prev) => [...prev, '']);
  const handleStopChange = (idx, value) => {
    setExtraStops((prev) => prev.map((s, i) => (i === idx ? value : s)));
  };
  const handleRemoveStop = (idx) => {
    setExtraStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearRoute = () => {
    setPlannedRoute(null);
    setMessage('');
    setNavigationActive(false);
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  };

  const calculateRoute = async () => {
    setIsCalculating(true);
    setMessage('');
    try {
      let points = [];
      if (mode === 'addresses') {
        if (!aAddress.trim() || !bAddress.trim()) {
          throw new Error('Debes indicar direccion A y direccion B.');
        }
        const stopAddresses = extraStops.map((s) => s.trim()).filter(Boolean);
        const addresses = [aAddress.trim(), ...stopAddresses, bAddress.trim()];
        points = await Promise.all(addresses.map(geocodeAddress));
      } else {
        if (drawPoints.length < 2) {
          throw new Error('Dibuja al menos dos puntos en el mapa.');
        }
        points = drawPoints;
      }

      const route = await fetchRoute(points);
      setPlannedRoute(route);
      setCenter(route.points[0] || center);
      if (mapRef.current && route.points[0]) mapRef.current.setView(route.points[0], 14);
      setMessage(`Ruta lista: ${route.distanceKm.toFixed(1)} km · ${Math.round(route.durationMin)} min.`);
    } catch (error) {
      setMessage(error.message || 'No se pudo generar la ruta.');
    } finally {
      setIsCalculating(false);
    }
  };

  const startNavigation = () => {
    if (!plannedRoute?.points?.length) return;
    if (!navigator.geolocation) {
      setMessage('Tu navegador no soporta geolocalizacion.');
      return;
    }
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setCurrentPos(p);
        if (mapRef.current) mapRef.current.setView(p, 16);
      },
      () => setMessage('No se pudo actualizar la ubicacion durante la guia.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );
    setNavigationActive(true);
  };

  const stopNavigation = () => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setNavigationActive(false);
  };

  const openInGoogleMaps = () => {
    if (!plannedRoute?.points?.length) return;
    const start = plannedRoute.points[0];
    const end = plannedRoute.points[plannedRoute.points.length - 1];
    const waypoints = plannedRoute.points
      .filter((_, idx) => idx % 20 === 0)
      .slice(1, -1)
      .map((p) => `${p[0]},${p[1]}`)
      .join('|');
    const url =
      `https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}`
      + `&destination=${end[0]},${end[1]}&travelmode=walking`
      + (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const distanceToFinish = React.useMemo(() => {
    if (!currentPos || !plannedRoute?.points?.length) return null;
    const end = plannedRoute.points[plannedRoute.points.length - 1];
    return distanceKm(currentPos, end);
  }, [currentPos, plannedRoute]);

  return (
    <div className="space-y-6">
      <div className="panel-card">
        <h2 className="section-title">Programar ruta</h2>
        <p className="helper-text mb-3">
          Elige entre direcciones A/B (con paradas) o dibujar en mapa. Luego activa guia en vivo.
        </p>

        <div className="menu-row mb-4">
          <button
            onClick={() => setMode('addresses')}
            className={`tab-btn ${mode === 'addresses' ? 'tab-btn-active' : ''}`}
          >
            Direcciones A/B
          </button>
          <button
            onClick={() => setMode('draw')}
            className={`tab-btn ${mode === 'draw' ? 'tab-btn-active' : ''}`}
          >
            Dibujar ruta en mapa
          </button>
        </div>

        {mode === 'addresses' && (
          <div className="form-stack mb-4">
            <input
              className="form-control"
              placeholder="Direccion A (inicio)"
              value={aAddress}
              onChange={(e) => setAAddress(e.target.value)}
            />
            <input
              className="form-control"
              placeholder="Direccion B (destino)"
              value={bAddress}
              onChange={(e) => setBAddress(e.target.value)}
            />
            {extraStops.map((stop, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className="form-control"
                  placeholder={`Parada intermedia ${idx + 1}`}
                  value={stop}
                  onChange={(e) => handleStopChange(idx, e.target.value)}
                />
                <button className="tab-btn" type="button" onClick={() => handleRemoveStop(idx)}>
                  Quitar
                </button>
              </div>
            ))}
            <button type="button" className="tab-btn" onClick={handleAddStop}>
              Agregar parada
            </button>
          </div>
        )}

        {mode === 'draw' && (
          <div className="info-banner">
            Haz clic en el mapa para dibujar la ruta. Puntos: {drawPoints.length}
            <button
              type="button"
              className="ml-3 tab-btn"
              onClick={() => setDrawPoints([])}
            >
              Limpiar puntos
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <button type="button" className="primary-btn" onClick={calculateRoute} disabled={isCalculating}>
            {isCalculating ? 'Calculando...' : 'Calcular ruta'}
          </button>
          <button type="button" className="tab-btn" onClick={requestLocation}>
            Usar mi ubicacion
          </button>
          <button type="button" className="tab-btn" onClick={clearRoute}>
            Reiniciar
          </button>
        </div>

        {message && <div className="info-banner">{message}</div>}

        {plannedRoute && (
          <div className="flex flex-wrap gap-2 mb-3">
            {!navigationActive ? (
              <button type="button" className="primary-btn" onClick={startNavigation}>
                Iniciar guia
              </button>
            ) : (
              <button type="button" className="danger-btn" onClick={stopNavigation}>
                Detener guia
              </button>
            )}
            <button type="button" className="tab-btn" onClick={openInGoogleMaps}>
              Abrir en Google Maps
            </button>
          </div>
        )}

        {navigationActive && (
          <div className="info-banner">
            Guia activa.
            {distanceToFinish != null && ` Distancia al destino: ${distanceToFinish.toFixed(2)} km.`}
          </div>
        )}
      </div>

      <div className="panel-card">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '520px', width: '100%', borderRadius: '18px' }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler enabled={mode === 'draw'} onMapClick={(p) => setDrawPoints((prev) => [...prev, p])} />

          {mode === 'draw' && drawPoints.map((point, idx) => <Marker key={`draw-${idx}`} position={point} />)}
          {mode === 'draw' && drawPoints.length > 1 && <Polyline positions={drawPoints} pathOptions={{ color: '#22c55e' }} />}

          {plannedRoute?.points?.length > 1 && (
            <Polyline positions={plannedRoute.points} pathOptions={{ color: '#0ea5e9', weight: 6 }} />
          )}

          {plannedRoute?.points?.[0] && <Marker position={plannedRoute.points[0]} />}
          {plannedRoute?.points?.length > 0 && (
            <Marker position={plannedRoute.points[plannedRoute.points.length - 1]} />
          )}

          {currentPos && <Marker position={currentPos} />}
        </MapContainer>
      </div>

      {plannedRoute?.steps?.length > 0 && (
        <div className="panel-card">
          <h3 className="section-title">Indicaciones</h3>
          <div className="list-stack">
            {plannedRoute.steps.slice(0, 10).map((step, idx) => (
              <div key={idx} className="list-item">
                <p className="list-item-meta">{idx + 1}. {step}</p>
              </div>
            ))}
          </div>
          {plannedRoute.steps.length > 10 && (
            <p className="helper-text mt-2">Mostrando 10 de {plannedRoute.steps.length} indicaciones.</p>
          )}
        </div>
      )}

      {mode === 'addresses' && (
        <p className="helper-text">
          Puntos actuales: {addressPointCount}. Para mayor precision, usa "Usar mi ubicacion".
        </p>
      )}

      {mode === 'draw' && rawRoutePoints?.length > 0 && (
        <p className="helper-text">Puntos dibujados: {rawRoutePoints.length}.</p>
      )}
    </div>
  );
}
