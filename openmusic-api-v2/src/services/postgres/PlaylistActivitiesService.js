const { nanoid } = require('nanoid');
const pool = require('./pool');

class PlaylistActivitiesService {
  async addActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action)
             VALUES($1, $2, $3, $4, $5)`,
      values: [id, playlistId, songId, userId, action],
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

module.exports = PlaylistActivitiesService;
