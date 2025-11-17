import { getConnection } from '../config/database.js';

export class Movie {
  static async findByTmdbId(tmdbId) {
    const db = getConnection();
    const movie = db
      .prepare('SELECT * FROM movies WHERE tmdb_id = ?')
      .get(tmdbId);
    return movie || null;
  }

  static async create(movieData, userId) {
    const db = getConnection();
    const {
      id: tmdbId,
      title,
      overview,
      poster_path,
      release_date,
      vote_average,
    } = movieData;

    const result = db
      .prepare(
        `
      INSERT INTO movies (tmdb_id, title, overview, poster_path, release_date, vote_average, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        tmdbId,
        title,
        overview || null,
        poster_path || null,
        release_date || null,
        vote_average || null,
        userId,
      );

    return result.lastInsertRowid;
  }
}
