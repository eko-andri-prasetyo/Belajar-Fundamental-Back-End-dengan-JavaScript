const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class LikesService {
  constructor(pool) {
    this._pool = pool;
  }

  async isAlbumLiked(userId, albumId) {
    const query = {
      text: 'SELECT 1 FROM user_album_likes WHERE user_id = $1 AND album_id = $2 LIMIT 1',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async verifyUserNotLikeAlbum(userId, albumId) {
    const liked = await this.isAlbumLiked(userId, albumId);
    if (liked) {
      throw new InvariantError('Kamu tidak dapat menyukai album yang sama');
    }
  }

  async likeAlbum(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    try {
      const query = {
        text: 'INSERT INTO user_album_likes(id, user_id, album_id) VALUES($1, $2, $3)',
        values: [id, userId, albumId],
      };
      await this._pool.query(query);
    } catch (error) {
      // unique (user_id, album_id) violation
      if (error.code === '23505') {
        throw new InvariantError('Kamu tidak dapat menyukai album yang sama');
      }
      throw error;
    }
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kamu belum menyukai album ini');
    }
  }

  async getAlbumLikesCount(albumId) {
    const query = {
      text: 'SELECT COUNT(*)::int AS likes FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);
    return result.rows[0].likes;
  }
}

module.exports = LikesService;
