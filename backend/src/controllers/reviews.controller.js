import { query } from '../config/database.js';

export async function addPlaceReview(req, res) {
  try {
    const userId = req.user.userId;
    const { routeId, title, description, rating, photoUrls } = req.body;

    if (!routeId || !description || !rating) {
      return res.status(400).json({ error: 'Ruta, descripción y calificación son requeridos' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }

    // Verificar que la ruta existe
    const routeCheck = await query('SELECT id FROM routes WHERE id = $1', [routeId]);
    if (routeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    const result = await query(
      `INSERT INTO place_reviews (user_id, route_id, title, description, rating, photo_urls)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, route_id, title, description, rating, photo_urls, created_at`,
      [userId, routeId, title, description, rating, photoUrls || []]
    );

    const review = result.rows[0];
    res.status(201).json({
      message: 'Reseña añadida exitosamente',
      review: {
        id: review.id,
        userId: review.user_id,
        routeId: review.route_id,
        title: review.title,
        description: review.description,
        rating: review.rating,
        photos: review.photo_urls,
        createdAt: review.created_at,
      },
    });
  } catch (error) {
    console.error('Error al añadir reseña:', error);
    res.status(500).json({ error: 'Error al añadir reseña' });
  }
}

export async function updateReview(req, res) {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { title, description, rating, photoUrls } = req.body;

    // Verificar que el usuario es el propietario de la reseña
    const reviewCheck = await query('SELECT user_id FROM place_reviews WHERE id = $1', [reviewId]);
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    if (reviewCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Solo puedes editar tus propias reseñas' });
    }

    const result = await query(
      `UPDATE place_reviews 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           rating = COALESCE($3, rating),
           photo_urls = COALESCE($4, photo_urls),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, user_id, route_id, title, description, rating, photo_urls, updated_at`,
      [title, description, rating, photoUrls, reviewId]
    );

    const review = result.rows[0];
    res.status(200).json({
      message: 'Reseña actualizada exitosamente',
      review: {
        id: review.id,
        userId: review.user_id,
        routeId: review.route_id,
        title: review.title,
        description: review.description,
        rating: review.rating,
        photos: review.photo_urls,
        updatedAt: review.updated_at,
      },
    });
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    res.status(500).json({ error: 'Error al actualizar reseña' });
  }
}

export async function deleteReview(req, res) {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;

    // Verificar que el usuario es el propietario de la reseña
    const reviewCheck = await query('SELECT user_id FROM place_reviews WHERE id = $1', [reviewId]);
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    if (reviewCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Solo puedes eliminar tus propias reseñas' });
    }

    await query('DELETE FROM place_reviews WHERE id = $1', [reviewId]);

    res.status(200).json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
}

export async function getRouteReviews(req, res) {
  try {
    const { routeId } = req.params;

    const result = await query(
      `SELECT pr.id, pr.user_id, pr.title, pr.description, pr.rating, pr.photo_urls, pr.created_at, u.username, u.profile_picture_url
       FROM place_reviews pr
       LEFT JOIN users u ON pr.user_id = u.id
       WHERE pr.route_id = $1
       ORDER BY pr.created_at DESC`,
      [routeId]
    );

    const reviews = result.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      username: r.username,
      profilePicture: r.profile_picture_url,
      title: r.title,
      description: r.description,
      rating: r.rating,
      photos: r.photo_urls,
      createdAt: r.created_at,
    }));

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
}
