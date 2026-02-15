import React from 'react';
import { routesAPI } from '../services/api';
import { useAuthStore } from '../services/authStore';
import { getLocalRoutes, saveLocalRoute } from '../services/localData';

export default function RouteCreator() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [routes, setRoutes] = React.useState([]);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    distance: '',
    duration: '',
    sportType: 'running',
    difficulty: 'medium',
    location: '',
  });

  React.useEffect(() => {
    if (!user?.id) return;
    setRoutes(getLocalRoutes(user.id));
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);

    const payload = {
      ...formData,
      distance: parseFloat(formData.distance),
      duration: parseInt(formData.duration, 10),
    };

    try {
      await routesAPI.createRoute(payload);
      setMessage('Ruta enviada a la API.');
    } catch {
      const updated = saveLocalRoute(user.id, payload);
      setRoutes(updated.filter((r) => r.userId === user.id));
      setMessage('API no disponible: ruta guardada localmente.');
    } finally {
      setFormData({
        title: '',
        description: '',
        distance: '',
        duration: '',
        sportType: 'running',
        difficulty: 'medium',
        location: '',
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel-card">
        <h2 className="section-title">Crear nueva ruta</h2>
        {message && <div className="info-banner">{message}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <input
            type="text"
            name="title"
            placeholder="Nombre de la ruta"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
          />

          <textarea
            name="description"
            placeholder="Descripcion de la ruta"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />

          <input
            type="text"
            name="location"
            placeholder="Ubicacion"
            value={formData.location}
            onChange={handleChange}
            className="form-control"
          />

          <input
            type="number"
            name="distance"
            placeholder="Distancia (km)"
            value={formData.distance}
            onChange={handleChange}
            step="0.1"
            className="form-control"
            required
          />

          <input
            type="number"
            name="duration"
            placeholder="Duracion estimada (minutos)"
            value={formData.duration}
            onChange={handleChange}
            className="form-control"
            required
          />

          <select
            name="sportType"
            value={formData.sportType}
            onChange={handleChange}
            className="form-control"
          >
            <option value="running">Correr</option>
            <option value="cycling">Ciclismo</option>
            <option value="mixed">Mixto</option>
          </select>

          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="form-control"
          >
            <option value="easy">Facil</option>
            <option value="medium">Media</option>
            <option value="hard">Dificil</option>
          </select>

          <button type="submit" disabled={loading} className="primary-btn w-full">
            {loading ? 'Guardando...' : 'Guardar ruta'}
          </button>
        </form>
      </div>

      <div className="panel-card">
        <h3 className="section-title">Tus rutas creadas</h3>
        {routes.length === 0 && <p className="helper-text">Aun no tienes rutas.</p>}
        <div className="list-stack">
          {routes.slice(0, 8).map((route) => (
            <div key={route.id} className="list-item">
              <p className="list-item-title">{route.title}</p>
              <p className="list-item-meta">{route.distance} km · {route.duration} min · {route.sportType}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
