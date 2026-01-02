const pool = require('./pool');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  async addSongToPlaylist(playlistId, songId) {
    const query = { text: 'INSERT INTO playlist_songs(playlist_id, song_id) VALUES($1,$2)', values: [playlistId, songId] };
    try {
      await pool.query(query);
    } catch (e) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = { text: 'DELETE FROM playlist_songs WHERE playlist_id=$1 AND song_id=$2 RETURNING song_id', values: [playlistId, songId] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new InvariantError('Lagu gagal dihapus dari playlist');
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
}

module.exports = PlaylistSongsService;
