import { query } from '../config/database.js';
import { hashPassword, comparePassword, generateToken, validateEmail, validateUsername } from '../utils/auth.js';

export async function register(req, res) {
  try {
    const { username, email, password, firstName, lastName, sportPreference } = req.body;

    // Validaciones
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email y password son requeridos' });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Username debe tener 3-30 caracteres' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password debe tener mínimo 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Usuario o email ya existe' });
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Crear usuario
    const result = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, sport_preference)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, first_name, last_name, sport_preference, created_at`,
      [username, email, passwordHash, firstName || '', lastName || '', sportPreference || 'both']
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        sportPreference: user.sport_preference,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar usuario
    const result = await query(
      'SELECT id, username, email, password_hash, first_name, last_name, sport_preference FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id, user.username);

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        sportPreference: user.sport_preference,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

export async function getUserProfile(req, res) {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT id, username, email, first_name, last_name, profile_picture_url, bio, sport_preference, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // Obtener estadísticas
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_activities,
        COALESCE(SUM(distance), 0) as total_distance,
        COALESCE(SUM(calories_burned), 0) as total_calories,
        COALESCE(SUM(duration_minutes), 0) as total_time
       FROM activities WHERE user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture_url,
        bio: user.bio,
        sportPreference: user.sport_preference,
        joinedAt: user.created_at,
      },
      stats: {
        totalActivities: parseInt(stats.total_activities),
        totalDistance: parseFloat(stats.total_distance),
        totalCaloriesBurned: parseFloat(stats.total_calories),
        totalTime: parseInt(stats.total_time),
      },
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
}

export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, bio, sportPreference, profilePicture } = req.body;

    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           bio = COALESCE($3, bio),
           sport_preference = COALESCE($4, sport_preference),
           profile_picture_url = COALESCE($5, profile_picture_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, username, email, first_name, last_name, profile_picture_url, bio, sport_preference`,
      [firstName, lastName, bio, sportPreference, profilePicture, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture_url,
        bio: user.bio,
        sportPreference: user.sport_preference,
      },
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
}
