import React from 'react';
import { useAuthStore } from '../services/authStore';
import ActivityLogger from '../components/ActivityLogger';
import NutritionLogger from '../components/NutritionLogger';
import RouteCreator from '../components/RouteCreator';

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
    return <div className="text-center mt-10">Cargando...</div>;
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
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Tu perfil</h2>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">Usuario:</span> {user.username}</p>
              <p><span className="font-semibold">Email:</span> {user.email || 'Sin email'}</p>
              <p><span className="font-semibold">Nombre:</span> {user.firstName || '-'} {user.lastName || ''}</p>
              <p><span className="font-semibold">Deporte principal:</span> {user.sportPreference || '-'}</p>
            </div>
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setActiveSection('activities')}
              className="text-left bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold mb-2">Mis Actividades</h3>
              <p className="text-gray-600">Registra tus entrenamientos y progreso.</p>
            </button>
            <button
              onClick={() => setActiveSection('nutrition')}
              className="text-left bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold mb-2">Nutricion</h3>
              <p className="text-gray-600">Controla comidas y macros de forma simple.</p>
            </button>
            <button
              onClick={() => setActiveSection('routes')}
              className="text-left bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold mb-2">Rutas</h3>
              <p className="text-gray-600">Crea rutas para correr, caminar o ciclismo.</p>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">SportCommunity</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Cerrar sesion
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-3xl font-bold mb-2">Bienvenido, {user.firstName || user.username}</h2>
          <p className="text-gray-600">Usa el menu para moverte por la plataforma.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`px-4 py-2 rounded border ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
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
