/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    cover_url: { type: 'TEXT' }, // optional (kalau proyek kamu pakai cover)
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
