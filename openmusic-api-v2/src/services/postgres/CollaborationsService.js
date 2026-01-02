const { nanoid } = require('nanoid');
const pool = require('./pool');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    try {
      const query = {
        text: 'INSERT INTO collaborations(id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id',
        values: [id, playlistId, userId],
      };

      const result = await pool.query(query);
      return result.rows[0].id;
    } catch (error) {
      // unique violation or FK violation
      if (error.code === '23505') {
        throw new InvariantError('Kolaborasi sudah ada');
      }
      if (error.code === '23503') {
        throw new NotFoundError('Playlist atau user tidak ditemukan');
      }
      throw error;
    }
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Kolaborasi tidak ditemukan');
    }
  }
}

module.exports = CollaborationsService;
