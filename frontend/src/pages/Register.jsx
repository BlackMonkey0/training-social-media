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
      { value: 'basketball', label: 'Baloncesto' },
      { value: 'volleyball', label: 'Voleibol' },
      { value: 'rugby', label: 'Rugby' },
      { value: 'baseball', label: 'Beisbol' },
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
    ],
  },
  {
    category: 'Fuerza y combate',
    sports: [
      { value: 'gym', label: 'Gimnasio' },
      { value: 'crossfit', label: 'CrossFit' },
      { value: 'calisthenics', label: 'Calistenia' },
      { value: 'boxing', label: 'Boxeo' },
      { value: 'mma', label: 'MMA' },
      { value: 'judo', label: 'Judo' },
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
    <div className="auth-layout">
      <div className="auth-wrap">
        <aside className="auth-side">
          <h1 className="auth-side-title">Crea tu base</h1>
          <p className="text-slate-300">
            Define tu perfil deportivo y empieza a registrar actividad, nutricion y rutas desde hoy.
          </p>
          <div className="auth-side-list">
            <div className="auth-side-item">Seleccion por categorias deportivas</div>
            <div className="auth-side-item">Panel central para tu progreso</div>
            <div className="auth-side-item">Experiencia fluida y ordenada</div>
          </div>
        </aside>

        <section className="auth-card">
          <h2 className="auth-title">Crear cuenta</h2>
          <p className="auth-sub">Configura tu perfil inicial.</p>

          <form onSubmit={handleSubmit} className="form-stack">
            {error && <div className="error-box">{error}</div>}

            <input
              type="text"
              name="username"
              placeholder="Usuario"
              value={formData.username}
              onChange={handleChange}
              className="form-control"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                name="firstName"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={handleChange}
                className="form-control"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <input
              type="password"
              name="password"
              placeholder="Contrasena"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
            />

            <select
              name="sportPreference"
              value={formData.sportPreference}
              onChange={handleChange}
              className="form-control"
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

            <button type="submit" className="primary-btn w-full">
              Crear cuenta y entrar
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="auth-link">
              Inicia sesion
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
