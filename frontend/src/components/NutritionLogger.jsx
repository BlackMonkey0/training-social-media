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
      <div className="panel-card">
        <h2 className="section-title">Registrar nutricion</h2>
        {message && <div className="info-banner">{message}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="form-control"
          >
            <option value="breakfast">Desayuno</option>
            <option value="lunch">Almuerzo</option>
            <option value="dinner">Cena</option>
            <option value="snack">Merienda</option>
            <option value="during_activity">Durante actividad</option>
          </select>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-2xl font-bold mb-3">Agregar alimentos</h3>

            <input
              type="text"
              name="name"
              placeholder="Nombre del alimento"
              value={newFood.name}
              onChange={handleFoodChange}
              className="form-control mb-2"
            />

            <input
              type="number"
              name="calories"
              placeholder="Calorias"
              value={newFood.calories}
              onChange={handleFoodChange}
              className="form-control mb-2"
              step="0.1"
            />

            <input
              type="number"
              name="protein"
              placeholder="Proteina (g)"
              value={newFood.protein}
              onChange={handleFoodChange}
              className="form-control mb-2"
              step="0.1"
            />

            <button type="button" onClick={addFood} className="primary-btn w-full mb-4">
              Agregar alimento
            </button>

            {foods.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xl font-bold mb-2">Alimentos agregados</h4>
                {foods.map((food, idx) => (
                  <div key={`${food.name}-${idx}`} className="list-item mb-2">
                    <p className="list-item-title">{food.name}</p>
                    <p className="list-item-meta">{food.calories} cal</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="primary-btn w-full">
            {loading ? 'Guardando...' : 'Guardar nutricion'}
          </button>
        </form>
      </div>

      <div className="panel-card">
        <h3 className="section-title">Tus registros nutricionales</h3>
        {records.length === 0 && <p className="helper-text">Aun no tienes registros.</p>}
        <div className="list-stack">
          {records.slice(0, 8).map((record) => (
            <div key={record.id} className="list-item">
              <p className="list-item-title">{record.mealType}</p>
              <p className="list-item-meta">{record.foods?.length || 0} alimento(s)</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
