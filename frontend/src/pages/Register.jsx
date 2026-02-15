import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

const SPORTS_BY_CATEGORY = [
  {
    category: 'Resistencia y cardio',
    sports: [
      { value: 'running', label: 'Running' },
      { value: 'trail_running', label: 'Trail running' },
      { value: 'walking', label: 'Caminata deportiva' },
      { value: 'hiking', label: 'Senderismo' },
      { value: 'cycling', label: 'Ciclismo' },
      { value: 'mtb', label: 'Mountain bike (MTB)' },
      { value: 'spinning', label: 'Spinning' },
      { value: 'triathlon', label: 'Triatlon' },
      { value: 'duathlon', label: 'Duatlon' },
    ],
  },
  {
    category: 'Acuaticos',
    sports: [
      { value: 'swimming', label: 'Natacion' },
      { value: 'open_water', label: 'Aguas abiertas' },
      { value: 'water_polo', label: 'Waterpolo' },
      { value: 'rowing', label: 'Remo' },
      { value: 'canoeing', label: 'Piraguismo / canoa' },
      { value: 'surf', label: 'Surf' },
      { value: 'paddle_surf', label: 'Paddle surf' },
      { value: 'kitesurf', label: 'Kitesurf' },
      { value: 'sailing', label: 'Vela' },
    ],
  },
  {
    category: 'Equipo y cancha',
    sports: [
      { value: 'football', label: 'Futbol' },
      { value: 'futsal', label: 'Futbol sala' },
      { value: 'basketball', label: 'Baloncesto' },
      { value: 'handball', label: 'Balonmano' },
      { value: 'volleyball', label: 'Voleibol' },
      { value: 'beach_volley', label: 'Voley playa' },
      { value: 'rugby', label: 'Rugby' },
      { value: 'baseball', label: 'Beisbol' },
      { value: 'softball', label: 'Softbol' },
      { value: 'hockey', label: 'Hockey' },
    ],
  },
  {
    category: 'Raqueta y pala',
    sports: [
      { value: 'tennis', label: 'Tenis' },
      { value: 'padel', label: 'Padel' },
      { value: 'badminton', label: 'Badminton' },
      { value: 'table_tennis', label: 'Tenis de mesa' },
      { value: 'squash', label: 'Squash' },
      { value: 'pickleball', label: 'Pickleball' },
      { value: 'fronton', label: 'Fronton' },
    ],
  },
  {
    category: 'Fuerza y fitness',
    sports: [
      { value: 'gym', label: 'Gimnasio / musculacion' },
      { value: 'crossfit', label: 'CrossFit' },
      { value: 'calisthenics', label: 'Calistenia' },
      { value: 'functional', label: 'Entrenamiento funcional' },
      { value: 'bodybuilding', label: 'Culturismo' },
      { value: 'powerlifting', label: 'Powerlifting' },
      { value: 'weightlifting', label: 'Halterofilia' },
    ],
  },
  {
    category: 'Combate y artes marciales',
    sports: [
      { value: 'boxing', label: 'Boxeo' },
      { value: 'kickboxing', label: 'Kickboxing' },
      { value: 'mma', label: 'MMA' },
      { value: 'judo', label: 'Judo' },
      { value: 'karate', label: 'Karate' },
      { value: 'taekwondo', label: 'Taekwondo' },
      { value: 'bjj', label: 'Brazilian Jiu-Jitsu' },
      { value: 'wrestling', label: 'Lucha' },
    ],
  },
  {
    category: 'Montana y aventura',
    sports: [
      { value: 'climbing', label: 'Escalada' },
      { value: 'mountaineering', label: 'Montanismo' },
      { value: 'canyoning', label: 'Barranquismo' },
      { value: 'paragliding', label: 'Parapente' },
      { value: 'skate', label: 'Skate' },
      { value: 'bmx', label: 'BMX' },
    ],
  },
  {
    category: 'Invierno',
    sports: [
      { value: 'ski_alpine', label: 'Esqui alpino' },
      { value: 'ski_nordic', label: 'Esqui nordico' },
      { value: 'snowboard', label: 'Snowboard' },
      { value: 'ice_skating', label: 'Patinaje sobre hielo' },
      { value: 'ice_hockey', label: 'Hockey hielo' },
    ],
  },
  {
    category: 'Motor',
    sports: [
      { value: 'motocross', label: 'Motocross' },
      { value: 'karting', label: 'Karting' },
      { value: 'rally', label: 'Rally' },
      { value: 'simracing', label: 'Simracing' },
    ],
  },
  {
    category: 'Otros',
    sports: [
      { value: 'dance', label: 'Baile deportivo' },
      { value: 'yoga', label: 'Yoga' },
      { value: 'pilates', label: 'Pilates' },
      { value: 'chess', label: 'Ajedrez' },
      { value: 'other', label: 'Otro' },
    ],
  },
];

export default function Register() {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    sportPreference: 'running',
  });
  const [error, setError] = React.useState('');
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error
          || (err.request ? 'No se pudo conectar con la API. Verifica backend y VITE_API_URL.' : 'Error al registrarse')
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Unete a SportCommunity</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            name="firstName"
            placeholder="Nombre"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="lastName"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Contrasena"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <select
            name="sportPreference"
            value={formData.sportPreference}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SPORTS_BY_CATEGORY.map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.sports.map((sport) => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
