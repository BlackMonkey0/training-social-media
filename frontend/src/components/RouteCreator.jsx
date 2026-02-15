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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Crear nueva ruta</h2>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-100 text-blue-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Nombre de la ruta"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <textarea
            name="description"
            placeholder="Descripcion de la ruta"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            rows="3"
          />

          <input
            type="text"
            name="location"
            placeholder="Ubicacion"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="number"
            name="distance"
            placeholder="Distancia (km)"
            value={formData.distance}
            onChange={handleChange}
            step="0.1"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="number"
            name="duration"
            placeholder="Duracion estimada (minutos)"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <select
            name="sportType"
            value={formData.sportType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="running">Correr</option>
            <option value="cycling">Ciclismo</option>
            <option value="mixed">Mixto</option>
          </select>

          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="easy">Facil</option>
            <option value="medium">Media</option>
            <option value="hard">Dificil</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar ruta'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-3">Tus rutas creadas</h3>
        {routes.length === 0 && <p className="text-gray-600">Aun no tienes rutas.</p>}
        <div className="space-y-2">
          {routes.slice(0, 8).map((route) => (
            <div key={route.id} className="border rounded p-3">
              <p className="font-semibold">{route.title}</p>
              <p className="text-sm text-gray-600">
                {route.distance} km · {route.duration} min · {route.sportType}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
