import { query } from '../config/database.js';
import { calculateNutrition } from '../utils/nutrition.js';

export async function logNutrition(req, res) {
  try {
    const userId = req.user.userId;
    const { activityId, mealType, foods, notes } = req.body;

    if (!mealType || !foods || foods.length === 0) {
      return res.status(400).json({ error: 'Tipo de comida y alimentos son requeridos' });
    }

    // Calcular macronutrientes automáticamente
    const totals = calculateNutrition(foods);

    const result = await query(
      `INSERT INTO nutrition_logs (user_id, activity_id, meal_type, food_items, total_calories, total_protein, total_carbs, total_fats, total_fiber, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, user_id, activity_id, meal_type, total_calories, total_protein, total_carbs, total_fats, total_fiber, logged_at`,
      [userId, activityId, mealType, JSON.stringify(foods), totals.calories, totals.protein, totals.carbs, totals.fats, totals.fiber, notes]
    );

    const nutrition = result.rows[0];
    res.status(201).json({
      message: 'Registro nutricional añadido',
      nutrition: {
        id: nutrition.id,
        mealType: nutrition.meal_type,
        totals: {
          calories: nutrition.total_calories,
          protein: nutrition.total_protein,
          carbs: nutrition.total_carbs,
          fats: nutrition.total_fats,
          fiber: nutrition.total_fiber,
        },
        loggedAt: nutrition.logged_at,
      },
    });
  } catch (error) {
    console.error('Error al registrar nutrición:', error);
    res.status(500).json({ error: 'Error al registrar nutrición' });
  }
}

export async function getNutritionLogs(req, res) {
  try {
    const userId = req.user.userId;
    const { limit = 30, offset = 0 } = req.query;

    const result = await query(
      `SELECT id, meal_type, food_items, total_calories, total_protein, total_carbs, total_fats, total_fiber, logged_at
       FROM nutrition_logs
       WHERE user_id = $1
       ORDER BY logged_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const logs = result.rows.map(log => ({
      id: log.id,
      mealType: log.meal_type,
      foods: log.food_items,
      totals: {
        calories: log.total_calories,
        protein: log.total_protein,
        carbs: log.total_carbs,
        fats: log.total_fats,
        fiber: log.total_fiber,
      },
      loggedAt: log.logged_at,
    }));

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error al obtener registros nutricionales:', error);
    res.status(500).json({ error: 'Error al obtener registros nutricionales' });
  }
}

export async function getNutritionStats(req, res) {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        COALESCE(AVG(total_calories), 0) as avg_calories,
        COALESCE(SUM(total_calories), 0) as total_calories,
        COALESCE(AVG(total_protein), 0) as avg_protein,
        COALESCE(AVG(total_carbs), 0) as avg_carbs,
        COALESCE(AVG(total_fats), 0) as avg_fats,
        COUNT(*) as total_logs,
        DATE(logged_at) as log_date
       FROM nutrition_logs
       WHERE user_id = $1 AND logged_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(logged_at)
       ORDER BY log_date DESC`,
      [userId]
    );

    const stats = result.rows.map(row => ({
      date: row.log_date,
      avgCalories: parseFloat(row.avg_calories),
      totalCalories: parseFloat(row.total_calories),
      avgProtein: parseFloat(row.avg_protein),
      avgCarbs: parseFloat(row.avg_carbs),
      avgFats: parseFloat(row.avg_fats),
      logsCount: parseInt(row.total_logs),
    }));

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error al obtener estadísticas nutricionales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas nutricionales' });
  }
}

export async function addFoodCustom(req, res) {
  try {
    const { name, calories, protein, carbs, fats, fiber } = req.body;

    if (!name || !calories) {
      return res.status(400).json({ error: 'Nombre y calorías son requeridos' });
    }

    // Retornar el alimento para que se use inmediatamente
    res.status(200).json({
      message: 'Alimento personalizado creado',
      food: {
        name,
        calories: parseFloat(calories),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fats: parseFloat(fats) || 0,
        fiber: parseFloat(fiber) || 0,
      },
    });
  } catch (error) {
    console.error('Error al crear alimento personalizado:', error);
    res.status(500).json({ error: 'Error al crear alimento' });
  }
}
