import React from 'react';
import { useAuthStore } from '../services/authStore';
import ActivityLogger from '../components/ActivityLogger';
import NutritionLogger from '../components/NutritionLogger';
import RouteCreator from '../components/RouteCreator';
import ProfileManager from '../components/ProfileManager';

const SECTIONS = [
  { key: 'overview', label: 'Resumen' },
  { key: 'activities', label: 'Actividades' },
  { key: 'nutrition', label: 'Nutricion' },
  { key: 'routes', label: 'Rutas' },
  { key: 'profile', label: 'Perfil' },
];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);
  const [activeSection, setActiveSection] = React.useState('overview');

  React.useEffect(() => {
    if (token && !user) {
      fetchProfile().catch(() => {});
    }
  }, [token, user, fetchProfile]);

  if (isLoading || !user) {
    return <div className="text-center mt-10 text-white">Cargando...</div>;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'activities':
        return <ActivityLogger />;
      case 'nutrition':
        return <NutritionLogger />;
      case 'routes':
        return <RouteCreator />;
      case 'profile':
        return <ProfileManager />;
      case 'overview':
      default:
        return (
          <div className="summary-grid">
            <button onClick={() => setActiveSection('activities')} className="summary-card">
              <h3 className="text-2xl font-bold mb-2">Mis Actividades</h3>
              <p className="text-slate-600">Registra entrenamientos y mide progreso.</p>
            </button>
            <button onClick={() => setActiveSection('nutrition')} className="summary-card">
              <h3 className="text-2xl font-bold mb-2">Nutricion</h3>
              <p className="text-slate-600">Organiza comidas y seguimiento diario.</p>
            </button>
            <button onClick={() => setActiveSection('routes')} className="summary-card">
              <h3 className="text-2xl font-bold mb-2">Rutas</h3>
              <p className="text-slate-600">Crea recorridos y guarda tus favoritos.</p>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="topbar-inner">
          <h1 className="brand">SportCommunity</h1>
          <button onClick={logout} className="danger-btn">Cerrar sesion</button>
        </div>
      </nav>

      <div className="main-wrap">
        <div className="hero-card">
          <h2 className="text-4xl font-bold mb-2">Bienvenido, {user.firstName || user.username}</h2>
          <p className="hero-sub">Panel deportivo centralizado para entrenar, comer y planificar mejor.</p>
        </div>

        <div className="menu-row">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`tab-btn ${isActive ? 'tab-btn-active' : ''}`}
              >
                {section.label}
              </button>
            );
          })}
        </div>

        {renderSection()}
      </div>
    </div>
  );
}
