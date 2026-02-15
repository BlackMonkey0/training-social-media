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
      <div className="panel-card">
        <h2 className="section-title">Registrar actividad</h2>

        {message && <div className="info-banner">{message}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <select
            name="activityType"
            value={formData.activityType}
            onChange={handleChange}
            className="form-control"
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
            className="form-control"
            required
          />

          <input
            type="number"
            name="duration"
            placeholder="Duracion (minutos)"
            value={formData.duration}
            onChange={handleChange}
            className="form-control"
            required
          />

          <input
            type="number"
            name="steps"
            placeholder="Pasos (opcional)"
            value={formData.steps}
            onChange={handleChange}
            className="form-control"
          />

          <input
            type="number"
            name="weight"
            placeholder="Peso (kg)"
            value={formData.weight}
            onChange={handleChange}
            step="0.1"
            className="form-control"
          />

          <button type="submit" disabled={loading} className="primary-btn w-full">
            {loading ? 'Guardando...' : 'Guardar actividad'}
          </button>
        </form>
      </div>

      <div className="panel-card">
        <h3 className="section-title">Tus actividades guardadas</h3>
        {records.length === 0 && <p className="helper-text">Aun no tienes actividades.</p>}
        <div className="list-stack">
          {records.slice(0, 8).map((record) => (
            <div key={record.id} className="list-item">
              <p className="list-item-title">{record.activityType}</p>
              <p className="list-item-meta">{record.distance} km · {record.duration} min</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
