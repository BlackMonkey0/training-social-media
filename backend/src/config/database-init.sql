-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_picture_url TEXT,
  bio TEXT,
  sport_preference VARCHAR(50), -- 'running', 'cycling', 'both'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de rutas deportivas
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  distance DECIMAL(10, 2), -- en km
  duration_minutes INTEGER,
  sport_type VARCHAR(50), -- 'running', 'cycling', 'mixed'
  difficulty_level VARCHAR(20), -- 'easy', 'medium', 'hard'
  location VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  gpx_data TEXT, -- Datos del recorrido GPS
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Tabla de participantes en rutas
CREATE TABLE route_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(route_id, user_id)
);

-- Tabla de actividades/tracking
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  activity_type VARCHAR(50), -- 'running', 'cycling'
  distance DECIMAL(10, 2), -- en km
  duration_minutes INTEGER,
  average_speed DECIMAL(10, 2), -- km/h
  calories_burned DECIMAL(10, 2),
  steps INT,
  elevation_gain DECIMAL(10, 2), -- metros
  heart_rate_avg INT,
  heart_rate_max INT,
  weather_condition VARCHAR(100),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  device_data JSONB -- Datos del dispositivo conectado
);

-- Tabla de nutrición
CREATE TABLE nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  meal_type VARCHAR(50), -- 'breakfast', 'lunch', 'dinner', 'snack', 'during_activity'
  food_items JSONB NOT NULL, -- Array de {name, calories, protein, carbs, fats, fiber}
  total_calories DECIMAL(10, 2),
  total_protein DECIMAL(10, 2),
  total_carbs DECIMAL(10, 2),
  total_fats DECIMAL(10, 2),
  total_fiber DECIMAL(10, 2),
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Tabla de fotos y reseñas
CREATE TABLE place_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  title VARCHAR(200),
  description TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  photo_urls TEXT[], -- Array de URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de seguidores (comunidad)
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Tabla de logros/badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_name VARCHAR(100),
  description TEXT,
  criteria TEXT,
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_route_id ON activities(route_id);
CREATE INDEX idx_activities_started_at ON activities(started_at DESC);
CREATE INDEX idx_nutrition_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_activity_id ON nutrition_logs(activity_id);
CREATE INDEX idx_routes_creator_id ON routes(creator_id);
CREATE INDEX idx_routes_location ON routes(location);
CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_following ON followers(following_id);
