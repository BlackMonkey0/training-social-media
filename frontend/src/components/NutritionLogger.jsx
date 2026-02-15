import React from 'react';
import { nutritionAPI } from '../services/api';
import { useAuthStore } from '../services/authStore';
import { getLocalNutrition, saveLocalNutrition } from '../services/localData';

export default function NutritionLogger() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [records, setRecords] = React.useState([]);
  const [foods, setFoods] = React.useState([]);
  const [mealType, setMealType] = React.useState('breakfast');
  const [newFood, setNewFood] = React.useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
  });

  React.useEffect(() => {
    if (!user?.id) return;
    setRecords(getLocalNutrition(user.id));
  }, [user?.id]);

  const handleFoodChange = (e) => {
    const { name, value } = e.target;
    setNewFood((prev) => ({ ...prev, [name]: value }));
  };

  const addFood = () => {
    if (!newFood.name || !newFood.calories) {
      setMessage('Nombre y calorias son requeridos.');
      return;
    }
    setFoods((prev) => [...prev, { ...newFood, quantity: 1 }]);
    setNewFood({ name: '', calories: '', protein: '', carbs: '', fats: '', fiber: '' });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    if (foods.length === 0) {
      setMessage('Agrega al menos un alimento.');
      return;
    }

    setLoading(true);
    const payload = { mealType, foods };

    try {
      await nutritionAPI.logNutrition(payload);
      setMessage('Registro nutricional enviado a la API.');
    } catch {
      const updated = saveLocalNutrition(user.id, payload);
      setRecords(updated.filter((r) => r.userId === user.id));
      setMessage('API no disponible: nutricion guardada localmente.');
    } finally {
      setFoods([]);
      setMealType('breakfast');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Registrar nutricion</h2>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-100 text-blue-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="breakfast">Desayuno</option>
            <option value="lunch">Almuerzo</option>
            <option value="dinner">Cena</option>
            <option value="snack">Merienda</option>
            <option value="during_activity">Durante actividad</option>
          </select>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Agregar alimentos</h3>

            <input
              type="text"
              name="name"
              placeholder="Nombre del alimento"
              value={newFood.name}
              onChange={handleFoodChange}
              className="w-full px-4 py-2 border rounded-lg mb-2"
            />

            <input
              type="number"
              name="calories"
              placeholder="Calorias"
              value={newFood.calories}
              onChange={handleFoodChange}
              className="w-full px-4 py-2 border rounded-lg mb-2"
              step="0.1"
            />

            <input
              type="number"
              name="protein"
              placeholder="Proteina (g)"
              value={newFood.protein}
              onChange={handleFoodChange}
              className="w-full px-4 py-2 border rounded-lg mb-2"
              step="0.1"
            />

            <button
              type="button"
              onClick={addFood}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-4"
            >
              Agregar alimento
            </button>

            {foods.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Alimentos agregados</h4>
                {foods.map((food, idx) => (
                  <div key={`${food.name}-${idx}`} className="bg-gray-100 p-2 rounded mb-2">
                    <p>{food.name} - {food.calories} cal</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar nutricion'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-3">Tus registros nutricionales</h3>
        {records.length === 0 && <p className="text-gray-600">Aun no tienes registros.</p>}
        <div className="space-y-2">
          {records.slice(0, 8).map((record) => (
            <div key={record.id} className="border rounded p-3">
              <p className="font-semibold">{record.mealType}</p>
              <p className="text-sm text-gray-600">
                {record.foods?.length || 0} alimento(s)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
