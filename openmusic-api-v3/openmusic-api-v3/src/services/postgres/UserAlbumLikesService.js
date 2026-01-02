const { nanoid } = require('nanoid');
const pool = require('./pool');
const InvariantError = require('../../exceptions/InvariantError');

class UserAlbumLikesService {
  async verifyUserHasNotLikedAlbum(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await pool.query(query);
    if (result.rows.length > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }
  }

  async likeAlbum(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    await pool.query({
      text: 'INSERT INTO user_album_likes(id, user_id, album_id) VALUES($1,$2,$3)',
      values: [id, userId, albumId],
    });
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
