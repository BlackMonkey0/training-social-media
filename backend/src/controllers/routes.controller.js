import { query } from '../config/database.js';

export async function createRoute(req, res) {
  try {
    const userId = req.user.userId;
    const { title, description, distance, duration, sportType, difficulty, location, latitude, longitude, gpxData, imageUrl } = req.body;

    if (!title || !sportType) {
      return res.status(400).json({ error: 'Título y tipo de deporte son requeridos' });
    }

    const result = await query(
      `INSERT INTO routes (creator_id, title, description, distance, duration_minutes, sport_type, difficulty_level, location, latitude, longitude, gpx_data, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, creator_id, title, description, distance, duration_minutes, sport_type, difficulty_level, location, latitude, longitude, image_url, created_at`,
      [userId, title, description, distance, duration, sportType, difficulty, location, latitude, longitude, gpxData, imageUrl]
    );

    const route = result.rows[0];
    res.status(201).json({
      message: 'Ruta creada exitosamente',
      route: {
        id: route.id,
        creatorId: route.creator_id,
        title: route.title,
        description: route.description,
        distance: route.distance,
        duration: route.duration_minutes,
        sportType: route.sport_type,
        difficulty: route.difficulty_level,
        location: route.location,
        latitude: route.latitude,
        longitude: route.longitude,
        imageUrl: route.image_url,
        createdAt: route.created_at,
      },
    });
  } catch (error) {
    console.error('Error al crear ruta:', error);
    res.status(500).json({ error: 'Error al crear ruta' });
  }
}

export async function updateRoute(req, res) {
  try {
    const userId = req.user.userId;
    const { routeId } = req.params;
    const { title, description, distance, duration, sportType, difficulty, location, latitude, longitude, gpxData, imageUrl } = req.body;

    // Verificar que el usuario sea el creador
    const routeCheck = await query('SELECT creator_id FROM routes WHERE id = $1', [routeId]);

    if (routeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    if (routeCheck.rows[0].creator_id !== userId) {
      return res.status(403).json({ error: 'Solo el creador puede editar la ruta' });
    }

    const result = await query(
      `UPDATE routes 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           distance = COALESCE($3, distance),
           duration_minutes = COALESCE($4, duration_minutes),
           sport_type = COALESCE($5, sport_type),
           difficulty_level = COALESCE($6, difficulty_level),
           location = COALESCE($7, location),
           latitude = COALESCE($8, latitude),
           longitude = COALESCE($9, longitude),
           gpx_data = COALESCE($10, gpx_data),
           image_url = COALESCE($11, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING id, creator_id, title, description, distance, duration_minutes, sport_type, difficulty_level, location, latitude, longitude, image_url, updated_at`,
      [title, description, distance, duration, sportType, difficulty, location, latitude, longitude, gpxData, imageUrl, routeId]
    );

    const route = result.rows[0];
    res.status(200).json({
      message: 'Ruta actualizada exitosamente',
      route: {
        id: route.id,
        creatorId: route.creator_id,
        title: route.title,
        description: route.description,
        distance: route.distance,
        duration: route.duration_minutes,
        sportType: route.sport_type,
        difficulty: route.difficulty_level,
        location: route.location,
        latitude: route.latitude,
        longitude: route.longitude,
        imageUrl: route.image_url,
        updatedAt: route.updated_at,
      },
    });
  } catch (error) {
    console.error('Error al actualizar ruta:', error);
    res.status(500).json({ error: 'Error al actualizar ruta' });
  }
}

export async function getRoutes(req, res) {
  try {
    const { sportType, location, difficulty } = req.query;
    let whereClause = 'WHERE is_active = true';
    let params = [];
    let paramCount = 1;

    if (sportType) {
      whereClause += ` AND sport_type = $${paramCount}`;
      params.push(sportType);
      paramCount++;
    }

    if (location) {
      whereClause += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    if (difficulty) {
      whereClause += ` AND difficulty_level = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    const result = await query(
      `SELECT r.*, u.username, COUNT(rp.id) as participants_count
       FROM routes r
       LEFT JOIN users u ON r.creator_id = u.id
       LEFT JOIN route_participants rp ON r.id = rp.route_id
       ${whereClause}
       GROUP BY r.id, u.username
       ORDER BY r.created_at DESC
       LIMIT 50`,
      params
    );

    const routes = result.rows.map(r => ({
      id: r.id,
      creatorId: r.creator_id,
      creatorName: r.username,
      title: r.title,
      description: r.description,
      distance: r.distance,
      duration: r.duration_minutes,
      sportType: r.sport_type,
      difficulty: r.difficulty_level,
      location: r.location,
      latitude: r.latitude,
      longitude: r.longitude,
      imageUrl: r.image_url,
      participantsCount: parseInt(r.participants_count),
      createdAt: r.created_at,
    }));

    res.status(200).json({ routes });
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
}

export async function getRouteById(req, res) {
  try {
    const { routeId } = req.params;

    const result = await query(
      `SELECT r.*, u.username, u.profile_picture_url, COUNT(rp.id) as participants_count
       FROM routes r
       LEFT JOIN users u ON r.creator_id = u.id
       LEFT JOIN route_participants rp ON r.id = rp.route_id
       WHERE r.id = $1
       GROUP BY r.id, u.username, u.profile_picture_url`,
      [routeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    const r = result.rows[0];
    
    // Obtener reseñas
    const reviewsResult = await query(
      `SELECT pr.*, u.username, u.profile_picture_url
       FROM place_reviews pr
       LEFT JOIN users u ON pr.user_id = u.id
       WHERE pr.route_id = $1
       ORDER BY pr.created_at DESC`,
      [routeId]
    );

    res.status(200).json({
      route: {
        id: r.id,
        creatorId: r.creator_id,
        creatorName: r.username,
        creatorProfilePicture: r.profile_picture_url,
        title: r.title,
        description: r.description,
        distance: r.distance,
        duration: r.duration_minutes,
        sportType: r.sport_type,
        difficulty: r.difficulty_level,
        location: r.location,
        latitude: r.latitude,
        longitude: r.longitude,
        imageUrl: r.image_url,
        participantsCount: parseInt(r.participants_count),
        createdAt: r.created_at,
      },
      reviews: reviewsResult.rows.map(review => ({
        id: review.id,
        userId: review.user_id,
        username: review.username,
        profilePicture: review.profile_picture_url,
        title: review.title,
        description: review.description,
        rating: review.rating,
        photos: review.photo_urls,
        createdAt: review.created_at,
      })),
    });
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    res.status(500).json({ error: 'Error al obtener ruta' });
  }
}

export async function joinRoute(req, res) {
  try {
    const userId = req.user.userId;
    const { routeId } = req.params;

    // Verificar que la ruta existe
    const routeCheck = await query('SELECT id FROM routes WHERE id = $1', [routeId]);
    if (routeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    // Intentar unirse a la ruta
    const result = await query(
      `INSERT INTO route_participants (route_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING id, joined_at`,
      [routeId, userId]
    );

    const joined = result.rows.length > 0;
    res.status(joined ? 201 : 200).json({
      message: joined ? 'Te has unido a la ruta' : 'Ya estabas unido a esta ruta',
      joined,
    });
  } catch (error) {
    console.error('Error al unirse a la ruta:', error);
    res.status(500).json({ error: 'Error al unirse a la ruta' });
  }
}

