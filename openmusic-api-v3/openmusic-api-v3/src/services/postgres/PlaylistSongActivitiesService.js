const pool = require('./pool');
const { createId } = require('../../utils/id');

class PlaylistSongActivitiesService {
  async addActivity({ playlistId, songId, userId, action }) {
    const id = createId('activity');
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action, time) VALUES($1,$2,$3,$4,$5,$6)',
      values: [id, playlistId, songId, userId, action, time],
    };
    await pool.query(query);
  }

  async getActivities(playlistId) {
    const query = {
      text: `
        SELECT u.username, s.title, a.action, a.time
        FROM playlist_song_activities a
        JOIN users u ON u.id = a.user_id
        JOIN songs s ON s.id = a.song_id
        WHERE a.playlist_id = $1
        ORDER BY a.time ASC
      `,
      values: [playlistId],
    };
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
