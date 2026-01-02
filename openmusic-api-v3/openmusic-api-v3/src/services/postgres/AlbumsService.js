const pool = require('./pool');
const { createId } = require('../../utils/id');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = createId('album');
    const query = { text: 'INSERT INTO albums(id, name, year) VALUES($1,$2,$3) RETURNING id', values: [id, name, year] };
    const result = await pool.query(query);
    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await pool.query({ text: 'SELECT id, name, year FROM albums ORDER BY name ASC' });
    return result.rows;
  }

  async getAlbumById(id) {
    const albumRes = await pool.query({ text: 'SELECT id, name, year, cover_url FROM albums WHERE id=$1', values: [id] });
    if (!albumRes.rows.length) throw new NotFoundError('Album tidak ditemukan');
    const album = albumRes.rows[0];

    const songsRes = await pool.query({
      text: 'SELECT id, title, performer FROM songs WHERE album_id=$1 ORDER BY title ASC',
      values: [id],
    });

    return {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover_url || null,
      songs: songsRes.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING id',
      values: [name, year, id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
  }

  async deleteAlbumById(id) {
    const query = { text: 'DELETE FROM albums WHERE id=$1 RETURNING id', values: [id] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
  }

  async setCoverUrl(id, coverUrl) {
    const query = { text: 'UPDATE albums SET cover_url=$1 WHERE id=$2 RETURNING id', values: [coverUrl, id] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Album tidak ditemukan');
  }

  async verifyAlbumExists(id) {
    const result = await pool.query({ text: 'SELECT id FROM albums WHERE id=$1', values: [id] });
    if (!result.rows.length) throw new NotFoundError('Album tidak ditemukan');
  }
}

module.exports = AlbumsService;
