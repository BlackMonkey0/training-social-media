import React from 'react';
import { activitiesAPI } from '../services/api';
import { useAuthStore } from '../services/authStore';
import { getLocalActivities, saveLocalActivity } from '../services/localData';

export default function ActivityLogger() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [records, setRecords] = React.useState([]);
  const [formData, setFormData] = React.useState({
    activityType: 'running',
    distance: '',
    duration: '',
    steps: '',
    weight: '70',
  });

  React.useEffect(() => {
    if (!user?.id) return;
    setRecords(getLocalActivities(user.id));
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
      steps: formData.steps ? parseInt(formData.steps, 10) : null,
      weight: parseFloat(formData.weight),
      startedAt: new Date().toISOString(),
    };

    try {
      await activitiesAPI.logActivity(payload);
      setMessage('Actividad registrada en la API.');
    } catch {
      const updated = saveLocalActivity(user.id, payload);
      setRecords(updated.filter((r) => r.userId === user.id));
      setMessage('API no disponible: actividad guardada localmente.');
    } finally {
      setFormData({
        activityType: 'running',
        distance: '',
        duration: '',
        steps: '',
        weight: '70',
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Registrar actividad</h2>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-100 text-blue-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="activityType"
            value={formData.activityType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="running">Correr</option>
            <option value="cycling">Ciclismo</option>
            <option value="walking">Caminar</option>
          </select>

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
            placeholder="Duracion (minutos)"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="number"
            name="steps"
            placeholder="Pasos (opcional)"
            value={formData.steps}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="number"
            name="weight"
            placeholder="Peso (kg)"
            value={formData.weight}
            onChange={handleChange}
            step="0.1"
            className="w-full px-4 py-2 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar actividad'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-3">Tus actividades guardadas</h3>
        {records.length === 0 && <p className="text-gray-600">Aun no tienes actividades.</p>}
        <div className="space-y-2">
          {records.slice(0, 8).map((record) => (
            <div key={record.id} className="border rounded p-3">
              <p className="font-semibold">{record.activityType}</p>
              <p className="text-sm text-gray-600">
                {record.distance} km · {record.duration} min
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
