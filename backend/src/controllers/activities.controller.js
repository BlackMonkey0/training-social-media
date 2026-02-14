import { query } from '../config/database.js';
import { calculateCaloriesBurned, calculateDistanceFromSteps, calculateCaloriesBurnedFromSteps } from '../utils/nutrition.js';

export async function logActivity(req, res) {
  try {
    const userId = req.user.userId;
    const { routeId, activityType, distance, duration, averageSpeed, steps, elevationGain, heartRateAvg, heartRateMax, weatherCondition, startedAt, endedAt, deviceData, weight } = req.body;

    if (!activityType || !duration) {
      return res.status(400).json({ error: 'Tipo de actividad y duración son requeridos' });
    }

    // Calcular calorías quemadas
    let caloriesBurned = 0;
    if (weight) {
      caloriesBurned = calculateCaloriesBurned(weight, activityType, duration);
    }

    // Si tenemos pasos, calcular distancia y calorías
    let calculatedDistance = distance;
    let additionalCalories = 0;
    if (steps) {
      calculatedDistance = calculateDistanceFromSteps(steps);
      additionalCalories = calculateCaloriesBurnedFromSteps(steps, weight || 70);
      caloriesBurned += additionalCalories;
    }

    const result = await query(
      `INSERT INTO activities (user_id, route_id, activity_type, distance, duration_minutes, average_speed, calories_burned, steps, elevation_gain, heart_rate_avg, heart_rate_max, weather_condition, started_at, ended_at, device_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, user_id, route_id, activity_type, distance, duration_minutes, calories_burned, steps, created_at`,
      [userId, routeId, activityType, calculatedDistance, duration, averageSpeed, caloriesBurned, steps, elevationGain, heartRateAvg, heartRateMax, weatherCondition, startedAt, endedAt, JSON.stringify(deviceData || {})]
    );

    const activity = result.rows[0];
    res.status(201).json({
      message: 'Actividad registrada exitosamente',
      activity: {
        id: activity.id,
        userId: activity.user_id,
        routeId: activity.route_id,
        activityType: activity.activity_type,
        distance: activity.distance,
        duration: activity.duration_minutes,
        caloriesBurned: activity.calories_burned,
        steps: activity.steps,
        createdAt: activity.created_at,
      },
    });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
    res.status(500).json({ error: 'Error al registrar actividad' });
  }
}

export async function getActivities(req, res) {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT id, activity_type, distance, duration_minutes, calories_burned, steps, elevation_gain, heart_rate_avg, heart_rate_max, started_at, created_at
       FROM activities
       WHERE user_id = $1
       ORDER BY started_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const activities = result.rows.map(a => ({
      id: a.id,
      activityType: a.activity_type,
      distance: a.distance,
      duration: a.duration_minutes,
      caloriesBurned: a.calories_burned,
      steps: a.steps,
      elevationGain: a.elevation_gain,
      heartRateAvg: a.heart_rate_avg,
      heartRateMax: a.heart_rate_max,
      startedAt: a.started_at,
      createdAt: a.created_at,
    }));

    res.status(200).json({ activities });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
}

export async function getActivityStats(req, res) {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        activity_type,
        COUNT(*) as count,
        COALESCE(SUM(distance), 0) as total_distance,
        COALESCE(SUM(duration_minutes), 0) as total_time,
        COALESCE(SUM(calories_burned), 0) as total_calories,
        COALESCE(AVG(distance), 0) as avg_distance,
        COALESCE(MAX(distance), 0) as max_distance,
        COALESCE(AVG(heart_rate_avg), 0) as avg_heart_rate
       FROM activities
       WHERE user_id = $1
       GROUP BY activity_type`,
      [userId]
    );

    const stats = result.rows.map(row => ({
      activityType: row.activity_type,
      count: parseInt(row.count),
      totalDistance: parseFloat(row.total_distance),
      totalTime: parseInt(row.total_time),
      totalCalories: parseFloat(row.total_calories),
      avgDistance: parseFloat(row.avg_distance),
      maxDistance: parseFloat(row.max_distance),
      avgHeartRate: Math.round(row.avg_heart_rate),
    }));

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

export async function syncDeviceData(req, res) {
  try {
    const userId = req.user.userId;
    const { deviceType, data } = req.body;

    // El dispositivo envía: pasos, frecuencia cardíaca, distancia, etc.
    // Esta función simula la integración con dispositivos Fitbit, Garmin, Apple Watch, etc.

    if (!deviceType || !data) {
      return res.status(400).json({ error: 'Tipo de dispositivo y datos son requeridos' });
    }

    // Aquí se procesaría la información del dispositivo
    const activity = await logActivityFromDevice(userId, deviceType, data);

    res.status(200).json({
      message: 'Datos del dispositivo sincronizados',
      activity,
    });
  } catch (error) {
    console.error('Error al sincronizar dispositivo:', error);
    res.status(500).json({ error: 'Error al sincronizar dispositivo' });
  }
}

async function logActivityFromDevice(userId, deviceType, deviceData) {
  // Extraer datos según el tipo de dispositivo
  let activityData = {
    user_id: userId,
    activity_type: deviceData.activityType || 'running',
    distance: deviceData.distance,
    duration_minutes: Math.round((deviceData.endTime - deviceData.startTime) / 60),
    steps: deviceData.steps,
    calories_burned: deviceData.calories,
    heart_rate_avg: deviceData.avgHeartRate,
    heart_rate_max: deviceData.maxHeartRate,
    started_at: new Date(deviceData.startTime),
    ended_at: new Date(deviceData.endTime),
    device_data: JSON.stringify({ deviceType, ...deviceData }),
  };

  const result = await query(
    `INSERT INTO activities (user_id, activity_type, distance, duration_minutes, steps, calories_burned, heart_rate_avg, heart_rate_max, started_at, ended_at, device_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    Object.values(activityData)
  );

  return result.rows[0];
}
