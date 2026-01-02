const { nanoid } = require('nanoid');
const pool = require('./pool');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  async addSongToPlaylist(playlistId, songId) {
    const id = `plsong-${nanoid(16)}`;

    try {
      const query = {
        text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3)',
        values: [id, playlistId, songId],
      };
      await pool.query(query);
    } catch (error) {
      if (error.code === '23505') {
        throw new InvariantError('Lagu sudah ada di playlist');
      }
      if (error.code === '23503') {
        throw new NotFoundError('Playlist atau lagu tidak ditemukan');
      }
      throw error;
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `
        SELECT s.id, s.title, s.performer
        FROM playlist_songs ps
        JOIN songs s ON s.id = ps.song_id
        WHERE ps.playlist_id = $1
        ORDER BY s.title ASC
      `,
      values: [playlistId],
    };

    const result = await pool.query(query);
    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING song_id',
      values: [playlistId, songId],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan di playlist');
    }
  }
}

module.exports = PlaylistSongsService;
