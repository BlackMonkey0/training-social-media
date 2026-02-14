import React from 'react';
import { nutritionAPI } from '../services/api';

export default function NutritionLogger() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
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

  const handleFoodChange = (e) => {
    const { name, value } = e.target;
    setNewFood((prev) => ({ ...prev, [name]: value }));
  };

  const addFood = async () => {
    if (!newFood.name || !newFood.calories) {
      setMessage('Nombre y calorías son requeridos');
      return;
    }

    // Si es un alimento personalizado, añadirlo a la lista
    setFoods((prev) => [...prev, { ...newFood, quantity: 1 }]);
    setNewFood({ name: '', calories: '', protein: '', carbs: '', fats: '', fiber: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (foods.length === 0) {
      setMessage('Añade al menos un alimento');
      return;
    }

    setLoading(true);
    try {
      await nutritionAPI.logNutrition({
        mealType,
        foods,
      });
      setMessage('¡Registro nutricional guardado exitosamente!');
      setFoods([]);
      setMealType('breakfast');
    } catch (error) {
      setMessage('Error al guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Registrar Alimentación</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('exitosamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
          <option value="during_activity">Durante la actividad</option>
        </select>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Añadir Alimentos</h3>
          
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
            placeholder="Calorías"
            value={newFood.calories}
            onChange={handleFoodChange}
            className="w-full px-4 py-2 border rounded-lg mb-2"
            step="0.1"
          />

          <input
            type="number"
            name="protein"
            placeholder="Proteína (g)"
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
            Añadir Alimento
          </button>

          {foods.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Alimentos añadidos:</h4>
              {foods.map((food, idx) => (
                <div key={idx} className="bg-gray-100 p-2 rounded mb-2">
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
          {loading ? 'Guardando...' : 'Guardar Registro Nutricional'}
        </button>
      </form>
    </div>
  );
}
