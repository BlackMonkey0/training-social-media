import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';

export default function Login() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error
        || (err.request ? 'No se pudo conectar con la API. Verifica backend y VITE_API_URL.' : 'Error al iniciar sesion')
      );
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-wrap">
        <aside className="auth-side">
          <h1 className="auth-side-title">Entrena mejor</h1>
          <p className="text-slate-300">
            Gestiona entrenamientos, nutricion y rutas en un solo panel. Diseno limpio, enfoque total en rendimiento.
          </p>
          <div className="auth-side-list">
            <div className="auth-side-item">Seguimiento diario de actividades</div>
            <div className="auth-side-item">Control nutricional por comidas</div>
            <div className="auth-side-item">Planificacion de rutas deportivas</div>
          </div>
        </aside>

        <section className="auth-card">
          <h2 className="auth-title">Iniciar sesion</h2>
          <p className="auth-sub">Accede a tu panel deportivo.</p>

          <form onSubmit={handleSubmit} className="form-stack">
            {error && <div className="error-box">{error}</div>}

            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
            />

            <input
              type="password"
              placeholder="Contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />

            <button type="submit" className="primary-btn w-full">
              Entrar al panel
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            No tienes cuenta?{' '}
            <Link to="/register" className="auth-link">
              Registrate aqui
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
