import React from 'react';
import { routesAPI } from '../services/api';

export default function RouteCreator() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    distance: '',
    duration: '',
    sportType: 'running',
    difficulty: 'medium',
    location: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await routesAPI.createRoute({
        ...formData,
        distance: parseFloat(formData.distance),
        duration: parseInt(formData.duration),
      });
      setMessage('¡Ruta creada exitosamente!');
      setFormData({
        title: '',
        description: '',
        distance: '',
        duration: '',
        sportType: 'running',
        difficulty: 'medium',
        location: '',
      });
    } catch (error) {
      setMessage('Error al crear la ruta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Crear Nueva Ruta</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('exitosamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
          placeholder="Descripción de la ruta"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          rows="3"
        />

        <input
          type="text"
          name="location"
          placeholder="Ubicación"
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
          placeholder="Duración estimada (minutos)"
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
          <option value="easy">Fácil</option>
          <option value="medium">Medio</option>
          <option value="hard">Difícil</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Ruta'}
        </button>
      </form>
    </div>
  );
}
