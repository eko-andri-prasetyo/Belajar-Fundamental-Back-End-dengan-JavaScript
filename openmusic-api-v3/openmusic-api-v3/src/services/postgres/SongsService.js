const pool = require('./pool');
const { createId } = require('../../utils/id');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = createId('song');
    const query = {
      text: 'INSERT INTO songs(id, title, year, performer, genre, duration, album_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      values: [id, title, year, performer, genre, duration || null, albumId || null],
    };
    const result = await pool.query(query);
    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    const base = 'SELECT id, title, performer FROM songs';
    const conditions = [];
    const values = [];
    if (title) { values.push(`%${title}%`); conditions.push(`LOWER(title) LIKE LOWER($${values.length})`); }
    if (performer) { values.push(`%${performer}%`); conditions.push(`LOWER(performer) LIKE LOWER($${values.length})`); }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query({ text: `${base}${where} ORDER BY title ASC`, values });
    return result.rows;
  }

  async getSongById(id) {
    const query = { text: 'SELECT id, title, year, performer, genre, duration, album_id as "albumId" FROM songs WHERE id=$1', values: [id] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Lagu tidak ditemukan');
    return result.rows[0];
  }

  async editSongById(id, payload) {
    const { title, year, performer, genre, duration, albumId } = payload;
    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING id',
      values: [title, year, performer, genre, duration || null, albumId || null, id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
  }

  async deleteSongById(id) {
    const query = { text: 'DELETE FROM songs WHERE id=$1 RETURNING id', values: [id] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
  }

  async verifySongExists(id) {
    const result = await pool.query({ text: 'SELECT id FROM songs WHERE id=$1', values: [id] });
    if (!result.rows.length) throw new NotFoundError('Lagu tidak ditemukan');
  }
}

module.exports = SongsService;
