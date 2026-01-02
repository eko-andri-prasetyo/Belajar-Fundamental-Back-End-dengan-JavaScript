const pool = require('./pool');
const { createId } = require('../../utils/id');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    const id = createId('collab');
    const query = { text: 'INSERT INTO collaborations(id, playlist_id, user_id) VALUES($1,$2,$3) RETURNING id', values: [id, playlistId, userId] };
    try {
      const result = await pool.query(query);
      return result.rows[0].id;
    } catch (e) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
  }

  async deleteCollaboration(playlistId, userId) {
    const query = { text: 'DELETE FROM collaborations WHERE playlist_id=$1 AND user_id=$2 RETURNING id', values: [playlistId, userId] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new InvariantError('Kolaborasi gagal dihapus');
  }

  async verifyCollaborator(playlistId, userId) {
    const query = { text: 'SELECT id FROM collaborations WHERE playlist_id=$1 AND user_id=$2', values: [playlistId, userId] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }
}

module.exports = CollaborationsService;
