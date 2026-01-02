const bcrypt = require('bcrypt');
const pool = require('./pool');
const { createId } = require('../../utils/id');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  async verifyNewUsername(username) {
    const query = { text: 'SELECT username FROM users WHERE username=$1', values: [username] };
    const result = await pool.query(query);
    if (result.rows.length) throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);
    const id = createId('user');
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users(id, username, password, fullname) VALUES($1,$2,$3,$4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };
    const result = await pool.query(query);
    return result.rows[0].id;
  }

  async getUserById(userId) {
    const query = { text: 'SELECT id, username, fullname FROM users WHERE id=$1', values: [userId] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new NotFoundError('User tidak ditemukan');
    return result.rows[0];
  }

  async getIdByUsername(username) {
    const query = { text: 'SELECT id FROM users WHERE username=$1', values: [username] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new InvariantError('Username tidak ditemukan');
    return result.rows[0].id;
  }

  async verifyUserCredential(username, password) {
    const query = { text: 'SELECT id, password FROM users WHERE username=$1', values: [username] };
    const result = await pool.query(query);
    if (!result.rows.length) throw new AuthenticationError('Kredensial yang Anda berikan salah');

    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) throw new AuthenticationError('Kredensial yang Anda berikan salah');
    return id;
  }
}

module.exports = UsersService;
