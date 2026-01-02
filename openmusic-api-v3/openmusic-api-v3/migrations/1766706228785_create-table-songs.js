/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    performer: { type: 'TEXT', notNull: true },
    genre: { type: 'TEXT', notNull: true },
    duration: { type: 'INTEGER' },
    album_id: { type: 'VARCHAR(50)' }, // boleh null
  });

  // FK album_id -> albums.id (set null saat album dihapus, biasanya paling aman)
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', {
    foreignKeys: {
      columns: 'album_id',
      references: 'albums(id)',
      onDelete: 'SET NULL',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
