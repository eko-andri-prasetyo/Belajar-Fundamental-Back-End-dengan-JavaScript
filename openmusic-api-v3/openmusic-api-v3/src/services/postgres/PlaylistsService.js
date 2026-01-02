const pool = require('./pool');
const { createId } = require('../../utils/id');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = createId('playlist');
    const query = { text: 'INSERT INTO playlists(id, name, owner) VALUES($1,$2,$3) RETURNING id', values: [id, name, owner] };
    const result = await pool.query(query);
    return result.rows[0].id;
  }

  async deletePlaylist(id) {
    const query = { text: 'DELETE FROM playlists WHERE id=$1 RETURNING id', values: [id] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan');
  }

  async getPlaylists(userId) {
    const query = {
      text: `
        SELECT p.id, p.name, u.username
        FROM playlists p
        JOIN users u ON u.id = p.owner
        LEFT JOIN collaborations c ON c.playlist_id = p.id
        WHERE p.owner = $1 OR c.user_id = $1
        GROUP BY p.id, u.username
        ORDER BY p.name ASC
      `,
      values: [userId],
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = { text: 'SELECT owner FROM playlists WHERE id=$1', values: [playlistId] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan');
    if (result.rows[0].owner !== userId) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      // try collaboration
      await this._collaborationsService.verifyCollaborator(playlistId, userId);
    }
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: `
        SELECT p.id, p.name, u.username
        FROM playlists p
        JOIN users u ON u.id = p.owner
        WHERE p.id = $1
      `,
      values: [playlistId],
    };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan');
    return result.rows[0];
  }

  async getPlaylistOwnerId(playlistId) {
    const result = await pool.query({ text: 'SELECT owner FROM playlists WHERE id=$1', values: [playlistId] });
    if (!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan');
    return result.rows[0].owner;
  }
}

module.exports = PlaylistsService;
