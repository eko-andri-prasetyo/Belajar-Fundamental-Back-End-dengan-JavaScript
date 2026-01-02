const mapSongRowToModel = (row) => ({
  id: row.id,
  title: row.title,
  year: row.year,
  performer: row.performer,
  genre: row.genre,
  duration: row.duration,
  albumId: row.album_id,
});

const mapSongRowToList = (row) => ({
  id: row.id,
  title: row.title,
  performer: row.performer,
});

module.exports = { mapSongRowToModel, mapSongRowToList };
