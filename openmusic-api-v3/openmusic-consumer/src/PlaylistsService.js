const pool = require('./pool');

class PlaylistsService {
  async getPlaylistExportData(playlistId) {
    const playlistRes = await pool.query({ text: 'SELECT id, name FROM playlists WHERE id=$1', values: [playlistId] });
    if (!playlistRes.rows.length) {
      return { playlist: { id: playlistId, name: null, songs: [] } };
    }

    const songsRes = await pool.query({
      text: `
        SELECT s.id, s.title, s.performer
        FROM playlist_songs ps
        JOIN songs s ON s.id = ps.song_id
        WHERE ps.playlist_id=$1
        ORDER BY s.title ASC
      `,
      values: [playlistId],
    });

    return { playlist: { id: playlistRes.rows[0].id, name: playlistRes.rows[0].name, songs: songsRes.rows } };
  }
}

module.exports = PlaylistsService;
