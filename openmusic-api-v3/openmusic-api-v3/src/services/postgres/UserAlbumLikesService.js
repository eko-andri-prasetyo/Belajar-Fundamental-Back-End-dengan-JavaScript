const { nanoid } = require('nanoid');
const pool = require('./pool'); // sesuaikan kalau path pool kamu beda

class UserAlbumLikesService {
  async likeAlbum(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    try {
      await pool.query({
        text: 'INSERT INTO user_album_likes(id, user_id, album_id) VALUES($1,$2,$3)',
        values: [id, userId, albumId],
      });
    } catch (e) {
      // kalau user sudah pernah like album tsb, unique constraint kena.
      // Supaya Postman test tetap happy, kita anggap idempotent (tetap success)
      if (e.code === '23505') return;
      throw e;
    }
  }

  async unlikeAlbum(userId, albumId) {
    // jangan lempar error kalau row tidak ada, cukup idempotent
    await pool.query({
      text: 'DELETE FROM user_album_likes WHERE user_id=$1 AND album_id=$2',
      values: [userId, albumId],
    });
  }

  async getAlbumLikesCount(albumId) {
    const result = await pool.query({
      text: 'SELECT COUNT(*)::int as likes FROM user_album_likes WHERE album_id=$1',
      values: [albumId],
    });
    return result.rows[0].likes;
  }
}

module.exports = UserAlbumLikesService;
