import React from 'react';
import { useAuthStore } from '../services/authStore';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">SportCommunity</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-3xl font-bold mb-2">¡Bienvenido, {user.firstName || user.username}!</h2>
          <p className="text-gray-600">Explora rutas, sigue a otros deportistas y alcanza tus objetivos de fitness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">🏃 Mis Actividades</h3>
            <p className="text-gray-600">Registra tus entrenamientos y sigue tu progreso</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">🍽️ Nutrición</h3>
            <p className="text-gray-600">Registra lo que comes y obtén análisis automático</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">🗺️ Rutas</h3>
            <p className="text-gray-600">Crea y descubre rutas deportivas de la comunidad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
