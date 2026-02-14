// Cálculo de macronutrientes automático basado en alimentos
const foodDatabase = {
  // Frutas
  manzana: { calories: 52, protein: 0.26, carbs: 13.8, fats: 0.17, fiber: 2.4 },
  platano: { calories: 89, protein: 1.09, carbs: 23, fats: 0.33, fiber: 2.6 },
  naranja: { calories: 47, protein: 0.9, carbs: 11.75, fats: 0.12, fiber: 2.4 },
  
  // Proteínas
  pollo: { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  huevo: { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
  salmon: { calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0 },
  atun: { calories: 132, protein: 29.1, carbs: 0, fats: 1.3, fiber: 0 },
  
  // Carbohidratos
  arroz: { calories: 206, protein: 2.7, carbs: 45, fats: 0.3, fiber: 0.4 },
  pan: { calories: 265, protein: 9, carbs: 49, fats: 3.3, fiber: 2.7 },
  pasta: { calories: 371, protein: 13, carbs: 75, fats: 1.1, fiber: 3 },
  
  // Verduras
  lechuga: { calories: 15, protein: 1.2, carbs: 2.9, fats: 0.2, fiber: 1.3 },
  tomate: { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2 },
  brocoli: { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.4 },
};

export function calculateNutrition(foods) {
  let totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  };

  foods.forEach(food => {
    const foodInfo = foodDatabase[food.name?.toLowerCase()] || {
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      fiber: food.fiber || 0,
    };

    const quantity = food.quantity || 1;
    totals.calories += foodInfo.calories * quantity;
    totals.protein += foodInfo.protein * quantity;
    totals.carbs += foodInfo.carbs * quantity;
    totals.fats += foodInfo.fats * quantity;
    totals.fiber += foodInfo.fiber * quantity;
  });

  return totals;
}

// Cálculo de calorías quemadas según actividad
export function calculateCaloriesBurned(weight, activityType, durationMinutes) {
  const mets = {
    running: 9.8,      // Moderado
    running_fast: 12.3, // Rápido
    cycling_moderate: 6.8,
    cycling_intense: 12.8,
    walking: 3.5,
  };

  const met = mets[activityType] || 5;
  return (met * weight * durationMinutes) / 60;
}

// Calcular distancia a partir de pasos
export function calculateDistanceFromSteps(steps, strideLength = 0.65) {
  return (steps * strideLength) / 1000; // en km
}

export function calculateCaloriesBurnedFromSteps(steps, weight) {
  const caloriesPerStep = weight * 0.04 / 1000; // aproximado
  return steps * caloriesPerStep;
}
