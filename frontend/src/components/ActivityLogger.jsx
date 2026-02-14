import React from 'react';
import { activitiesAPI } from '../services/api';

export default function ActivityLogger() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [formData, setFormData] = React.useState({
    activityType: 'running',
    distance: '',
    duration: '',
    steps: '',
    weight: '70',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await activitiesAPI.logActivity({
        ...formData,
        distance: parseFloat(formData.distance),
        duration: parseInt(formData.duration),
        steps: formData.steps ? parseInt(formData.steps) : null,
        weight: parseFloat(formData.weight),
        startedAt: new Date(),
      });
      setMessage('¡Actividad registrada exitosamente!');
      setFormData({
        activityType: 'running',
        distance: '',
        duration: '',
        steps: '',
        weight: '70',
      });
    } catch (error) {
      setMessage('Error al registrar la actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Registrar Actividad</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('exitosamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
          placeholder="Duración (minutos)"
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
          {loading ? 'Registrando...' : 'Registrar Actividad'}
        </button>
      </form>
    </div>
  );
}
